const MilkCategory = require("../models/MilkCategory");
const fs = require("fs");
const milkProduct = require("../models/MilkProduct");
const path = require("path");

// Get products by milk category ID
exports.getProductsByMilkCategoryId = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = await milkProduct.find({ categoryId });

    if (!products.length) {
      return res.status(404).json({
        success: false,
        message: "No products found for this category",
        data: [],
        error: null,
      });
    }

    res.json({
      success: true,
      message: "Products fetched successfully",
      data: products,
      error: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      data: [],
      error: error.message,
    });
  }
};

// Create Milk Category
exports.createMilkCategory = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({
        success: false,
        message: "Image is required",
        data: null,
        error: null,
      });

    const milkCategory = new MilkCategory({
      name: req.body.name,
      address: req.body.address,
      image: req.file.filename,
      rating: req.body.rating || 0,
    });

    await milkCategory.save();
    res.status(201).json({
      success: true,
      message: "Milk category created successfully",
      data: milkCategory,
      error: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create milk category",
      data: null,
      error: error.message,
    });
  }
};

// Get All Milk Categories
exports.getAllMilkCategories = async (req, res) => {
  try {
    const categories = await MilkCategory.find();
    res.json({
      success: true,
      message: "Categories fetched successfully",
      data: categories,
      error: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      data: [],
      error: error.message,
    });
  }
};

// Get One Milk Category
exports.getMilkCategoryById = async (req, res) => {
  try {
    const category = await MilkCategory.findById(req.params.id);
    if (!category)
      return res.status(404).json({
        success: false,
        message: "Milk category not found",
        data: null,
        error: null,
      });

    res.json({
      success: true,
      message: "Milk category fetched successfully",
      data: category,
      error: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch milk category",
      data: null,
      error: error.message,
    });
  }
};

// Update Milk Category
exports.updateMilkCategory = async (req, res) => {
  try {
    const category = await MilkCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Milk category not found",
        data: null,
        error: null,
      });
    }

    // ✅ Handle image upload (from field "image")
    if (req.file) {
      const oldImagePath = path.join(__dirname, "..", "uploads", category.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath); // delete old image file
      }

      category.image = req.file.filename; // multer stores filename (not full path)
    }

    // ✅ Update other fields
    category.name = req.body.name || category.name;
    category.address = req.body.address || category.address;
    category.rating = req.body.rating || category.rating;

    await category.save();

    res.json({
      success: true,
      message: "Milk category updated successfully",
      data: category,
      error: null,
    });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update milk category",
      data: null,
      error: error.message,
    });
  }
};

// Delete Milk Category
exports.deleteMilkCategory = async (req, res) => {
  try {
    const category = await MilkCategory.findById(req.params.id);
    if (!category)
      return res.status(404).json({
        success: false,
        message: "Milk category not found",
        data: null,
        error: null,
      });

    if (category.logo) fs.unlinkSync(category.logo);
    await MilkCategory.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Milk category deleted successfully",
      data: null,
      error: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete milk category",
      data: null,
      error: error.message,
    });
  }
};
