const FilterLabTestCategory = require("../models/FilterLabTestCategory");
const FilterLabTestProduct = require("../models/FilterLabTestProduct");
const LabTest = require("../models/labtest");

// FilterLabTestCategory CRUD
// Create a new category
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const category = new FilterLabTestCategory({ name, description });
    await category.save();
    return res.status(201).json({ message: "Category created successfully", data: category });
  } catch (err) {
    console.error("Error creating category:", err);
    return res.status(500).json({ message: "Error creating category", error: err.message });
  }
};

// Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await FilterLabTestCategory.find();
    return res.status(200).json({ data: categories });
  } catch (err) {
    console.error("Error fetching categories:", err);
    return res.status(500).json({ message: "Error fetching categories", error: err.message });
  }
};

// Update a category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await FilterLabTestCategory.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (name) category.name = name;
    if (description) category.description = description;
    category.updatedAt = new Date();

    await category.save();
    return res.status(200).json({ message: "Category updated successfully", data: category });
  } catch (err) {
    console.error("Error updating category:", err);
    return res.status(500).json({ message: "Error updating category", error: err.message });
  }
};

// Delete a category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await FilterLabTestCategory.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if category is used in any FilterLabTestProduct
    const products = await FilterLabTestProduct.find({ category: id });
    if (products.length > 0) {
      return res.status(400).json({ message: "Cannot delete category with associated products" });
    }

    await FilterLabTestCategory.deleteOne({ _id: id });
    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error("Error deleting category:", err);
    return res.status(500).json({ message: "Error deleting category", error: err.message });
  }
};

// FilterLabTestProduct CRUD
// Create a new product filter
const createProductFilter = async (req, res) => {
  try {
    const { labTestId, categoryId } = req.body;
    if (!labTestId || !categoryId) {
      return res.status(400).json({ message: "labTestId and categoryId are required" });
    }

    // Verify LabTest exists
    const labTest = await LabTest.findById(labTestId);
    if (!labTest) {
      return res.status(404).json({ message: "LabTest not found" });
    }

    // Verify Category exists
    const category = await FilterLabTestCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const productFilter = new FilterLabTestProduct({ labTest: labTestId, category: categoryId });
    await productFilter.save();
    return res.status(201).json({ message: "Product filter created successfully", data: productFilter });
  } catch (err) {
    console.error("Error creating product filter:", err);
    return res.status(500).json({ message: "Error creating product filter", error: err.message });
  }
};

// Get all product filters
const getProductFilters = async (req, res) => {
  try {
    const productFilters = await FilterLabTestProduct.find()
      .populate("labTest", "name price mrp image")
      .populate("category", "name");
    return res.status(200).json({ data: productFilters });
  } catch (err) {
    console.error("Error fetching product filters:", err);
    return res.status(500).json({ message: "Error fetching product filters", error: err.message });
  }
};

// Update a product filter
const updateProductFilter = async (req, res) => {
  try {
    const { id } = req.params;
    const { labTestId, categoryId } = req.body;

    const productFilter = await FilterLabTestProduct.findById(id);
    if (!productFilter) {
      return res.status(404).json({ message: "Product filter not found" });
    }

    if (labTestId) {
      const labTest = await LabTest.findById(labTestId);
      if (!labTest) {
        return res.status(404).json({ message: "LabTest not found" });
      }
      productFilter.labTest = depTestId;
    }

    if (categoryId) {
      const category = await FilterLabTestCategory.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      productFilter.category = categoryId;
    }

    productFilter.updatedAt = new Date();
    await productFilter.save();
    return res.status(200).json({ message: "Product filter updated successfully", data: productFilter });
  } catch (err) {
    console.error("Error updating product filter:", err);
    return res.status(500).json({ message: "Error updating product filter", error: err.message });
  }
};

// Delete a product filter
const deleteProductFilter = async (req, res) => {
  try {
    const { id } = req.params;
    const productFilter = await FilterLabTestProduct.findById(id);
    if (!productFilter) {
      return res.status(404).json({ message: "Product filter not found" });
    }

    await FilterLabTestProduct.deleteOne({ _id: id });
    return res.status(200).json({ message: "Product filter deleted successfully" });
  } catch (err) {
    console.error("Error deleting product filter:", err);
    return res.status(500).json({ message: "Error deleting product filter", error: err.message });
  }
};



const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Verify Category exists
    const category = await FilterLabTestCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const productFilters = await FilterLabTestProduct.find({ category: categoryId })
      .populate("labTest", "name price mrp discountPercentage location description")
      .populate("category", "name");
    
    return res.status(200).json({ 
      message: "Products retrieved successfully",
      data: productFilters 
    });
  } catch (err) {
    console.error("Error fetching products by category:", err);
    return res.status(500).json({ message: "Error fetching products by category", error: err.message });
  }
};

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  createProductFilter,
  getProductFilters,
  updateProductFilter,
  deleteProductFilter,
  getProductsByCategory
};