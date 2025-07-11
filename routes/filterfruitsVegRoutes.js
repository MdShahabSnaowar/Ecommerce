const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const FilterFruitsVegCategory = require("../models/FilterFruitsVegCategory");
const FilterFruitsVegSubcategory = require("../models/FilterFruitsVegSubcategory");
const FilterFruitsVegProduct = require("../models/FilterFruitsVegProduct");
const FruitsVegProduct = require("../models/FruitsVegProduct");
const authAdmin = require("../middleware/authAdmin");
// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Category CRUD
// Create Category
router.post("/categories", authAdmin,async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({
        message: "Name is required",
        data: null,
        error: true,
      });
    }
    const category = new FilterFruitsVegCategory({ name, description });
    await category.save();
    res.status(201).json({
      message: "Category created successfully",
      data: category,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
      error: true,
    });
  }
});

// Get All Categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await FilterFruitsVegCategory.find();
    res.status(200).json({
      message: "Categories fetched successfully",
      data: categories,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
      error: true,
    });
  }
});

// Update Category
router.put("/categories/:id", authAdmin,async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid category ID",
        data: null,
        error: true,
      });
    }
    const { name, description } = req.body;
    const category = await FilterFruitsVegCategory.findByIdAndUpdate(
      id,
      { name, description, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!category) {
      return res.status(404).json({
        message: "Category not found",
        data: null,
        error: true,
      });
    }
    res.status(200).json({
      message: "Category updated successfully",
      data: category,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
      error: true,
    });
  }
});

// Delete Category
router.delete("/categories/:id", authAdmin,async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid category ID",
        data: null,
        error: true,
      });
    }
    const category = await FilterFruitsVegCategory.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({
        message: "Category not found",
        data: null,
        error: true,
      });
    }
    res.status(200).json({
      message: "Category deleted successfully",
      data: category,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
      error: true,
    });
  }
});

// Subcategory CRUD
// Create Subcategory
router.post("/subcategories",authAdmin, async (req, res) => {
  try {
    const { name, categoryId, description } = req.body;
    if (!name || !categoryId) {
      return res.status(400).json({
        message: "Name and categoryId are required",
        data: null,
        error: true,
      });
    }
    if (!isValidObjectId(categoryId)) {
      return res.status(400).json({
        message: "Invalid category ID",
        data: null,
        error: true,
      });
    }
    const category = await FilterFruitsVegCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        message: "Category not found",
        data: null,
        error: true,
      });
    }
    const subcategory = new FilterFruitsVegSubcategory({ name, categoryId, description });
    await subcategory.save();
    res.status(201).json({
      message: "Subcategory created successfully",
      data: subcategory,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
      error: true,
    });
  }
});

// Get All Subcategories
router.get("/subcategories", async (req, res) => {
  try {
    const subcategories = await FilterFruitsVegSubcategory.find().populate("categoryId");
    res.status(200).json({
      message: "Subcategories fetched successfully",
      data: subcategories,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
      error: true,
    });
  }
});

// Update Subcategory
router.put("/subcategories/:id",authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid subcategory ID",
        data: null,
        error: true,
      });
    }
    const { name, categoryId, description } = req.body;
    if (categoryId && !isValidObjectId(categoryId)) {
      return res.status(400).json({
        message: "Invalid category ID",
        data: null,
        error: true,
      });
    }
    if (categoryId) {
      const category = await FilterFruitsVegCategory.findById(categoryId);
      if (!category) {
        return res.status(404).json({
          message: "Category not found",
          data: null,
          error: true,
        });
      }
    }
    const subcategory = await FilterFruitsVegSubcategory.findByIdAndUpdate(
      id,
      { name, categoryId, description, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!subcategory) {
      return res.status(404).json({
        message: "Subcategory not found",
        data: null,
        error: true,
      });
    }
    res.status(200).json({
      message: "Subcategory updated successfully",
      data: subcategory,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
      error: true,
    });
  }
});

// Delete Subcategory
router.delete("/subcategories/:id",authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid subcategory ID",
        data: null,
        error: true,
      });
    }
    const subcategory = await FilterFruitsVegSubcategory.findByIdAndDelete(id);
    if (!subcategory) {
      return res.status(404).json({
        message: "Subcategory not found",
        data: null,
        error: true,
      });
    }
    res.status(200).json({
      message: "Subcategory deleted successfully",
      data: subcategory,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
      error: true,
    });
  }
});

// Filter Product CRUD
// Create Filter Product
router.post("/filter-products",authAdmin, async (req, res) => {
  try {
    const { productIds, subcategoryId } = req.body;

    // Validate input
    if (!Array.isArray(productIds) || productIds.length === 0 || !subcategoryId) {
      return res.status(400).json({
        message: "productIds (non-empty array) and subcategoryId are required",
        data: null,
        error: true,
      });
    }

    // Validate ObjectIds
    if (!isValidObjectId(subcategoryId) || !productIds.every(id => isValidObjectId(id))) {
      return res.status(400).json({
        message: "One or more product IDs or subcategory ID is invalid",
        data: null,
        error: true,
      });
    }

    // Check if subcategory exists
    const subcategory = await FilterFruitsVegSubcategory.findById(subcategoryId);
    if (!subcategory) {
      return res.status(404).json({
        message: "Subcategory not found",
        data: null,
        error: true,
      });
    }

    // Check if all products exist
    const products = await FruitsVegProduct.find({ _id: { $in: productIds } });
    if (products.length !== productIds.length) {
      const foundIds = products.map(p => p._id.toString());
      const missingIds = productIds.filter(id => !foundIds.includes(id));
      return res.status(404).json({
        message: `Products not found for IDs: ${missingIds.join(", ")}`,
        data: null,
        error: true,
      });
    }

    // Find existing product-subcategory mappings
    const existingMappings = await FilterFruitsVegProduct.find({
      subcategoryId,
      productId: { $in: productIds },
    });

    const existingProductIds = existingMappings.map(item => item.productId.toString());

    // Filter out productIds that are already mapped
    const newProductIds = productIds.filter(id => !existingProductIds.includes(id));

    // If no new products to add, return early
    if (newProductIds.length === 0) {
      return res.status(200).json({
        message: "All provided products are already mapped to this subcategory",
        data: [],
        error: false,
      });
    }

    // Create new mappings for non-existing productIds
    const filterProducts = newProductIds.map(productId => ({
      productId,
      subcategoryId,
    }));

    // Insert new mappings
    const saved = await FilterFruitsVegProduct.insertMany(filterProducts, { ordered: false });

    // Prepare response with added and skipped products
    const responseData = {
      added: saved.map(item => ({
        productId: item.productId,
        subcategoryId: item.subcategoryId,
        _id: item._id,
      })),
      skipped: existingProductIds.map(id => ({ productId: id })),
    };

    res.status(201).json({
      message: `Successfully added ${saved.length} new product(s) to subcategory${existingProductIds.length > 0 ? `, ${existingProductIds.length} product(s) already mapped` : ""}`,
      data: responseData,
      error: false,
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        message: "One or more product-subcategory mappings already exist",
        data: null,
        error: true,
      });
    }
    res.status(500).json({
      message: `Server error: ${error.message}`,
      data: null,
      error: true,
    });
  }
});


router.put("/filter-products/:id",authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid filter product ID",
        data: null,
        error: true,
      });
    }
    const { productId, subcategoryId } = req.body;
    if (productId && !isValidObjectId(productId)) {
      return res.status(400).json({
        message: "Invalid product ID",
        data: null,
        error: true,
      });
    }
    if (subcategoryId && !isValidObjectId(subcategoryId)) {
      return res.status(400).json({
        message: "Invalid subcategory ID",
        data: null,
        error: true,
      });
    }
    if (productId) {
      const product = await FruitsVegProduct.findById(productId);
      if (!product) {
        return res.status(404).json({
          message: "Product not found",
          data: null,
          error: true,
        });
      }
    }
    if (subcategoryId) {
      const subcategory = await FilterFruitsVegSubcategory.findById(subcategoryId);
      if (!subcategory) {
        return res.status(404).json({
          message: "Subcategory not found",
          data: null,
          error: true,
        });
      }
    }
    const filterProduct = await FilterFruitsVegProduct.findByIdAndUpdate(
      id,
      { productId, subcategoryId, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!filterProduct) {
      return res.status(404).json({
        message: "Filter product not found",
        data: null,
        error: true,
      });
    }
    res.status(200).json({
      message: "Filter product updated successfully",
      data: filterProduct,
      error: false,
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This product-subcategory mapping already exists",
        data: null,
        error: true,
      });
    }
    res.status(500).json({
      message: error.message,
      data: null,
      error: true,
    });
  }
});

// Get All Filter Products
router.get("/filter-products", async (req, res) => {
  try {
    const filterProducts = await FilterFruitsVegProduct.find()
      .populate("productId")
      .populate("subcategoryId");
    res.status(200).json({
      message: "Filter products fetched successfully",
      data: filterProducts,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
      error: true,
    });
  }
});

// Update Filter Product
router.get("/subcategories/products/:subcategoryId", async (req, res) => {
  try {
    const { subcategoryId } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(subcategoryId)) {
      return res.status(400).json({
        message: "Invalid subcategory ID",
        data: null,
        error: true,
      });
    }

    // Check if subcategory exists
    const subcategory = await FilterFruitsVegSubcategory.findById(subcategoryId);
    if (!subcategory) {
      return res.status(404).json({
        message: "Subcategory not found",
        data: null,
        error: true,
      });
    }

    // Fetch all filter products for the subcategory and populate product details
    const filterProducts = await FilterFruitsVegProduct.find({ subcategoryId })
      .populate({
        path: "productId",
        select: "name images price mrp unit quantity isOrganic description origin availability",
      });

    // Extract only the product details
    const products = filterProducts.map(fp => fp.productId);

    res.status(200).json({
      message: `Successfully fetched ${products.length} product(s) for subcategory`,
      data: products,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: `Server error: ${error.message}`,
      data: null,
      error: true,
    });
  }
});

// Delete Filter Product
router.delete("/delete-products/:id",authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid filter product ID",
        data: null,
        error: true,
      });
    }
    const filterProduct = await FilterFruitsVegProduct.findByIdAndDelete(id);
    if (!filterProduct) {
      return res.status(404).json({
        message: "Filter product not found",
        data: null,
        error: true,
      });
    }
    res.status(200).json({
      message: "Filter product deleted successfully",
      data: filterProduct,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
      error: true,
    });
  }
});

module.exports = router;