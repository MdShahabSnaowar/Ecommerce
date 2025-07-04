const milkProduct = require("../models/MilkProduct");


exports.createMilkProduct = async (req, res) => {
  try {
    const { name, quantity, unit, price, categoryId, mrp } = req.body; // 👈 include mrp
    const image = req.file ? req.file.filename : null;

    if (!name || !quantity || !unit || !price || !categoryId || !image) {
      return res.status(400).json({
        success: false,
        message: "All fields including image are required",
        data: null,
        error: null,
      });
    }

    const product = new milkProduct({
      name,
      image,
      quantity,
      unit,
      price,
      categoryId,
      mrp, // 👈 pass mrp into product if provided
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Milk product created successfully",
      data: product,
      error: null,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to create milk product",
      data: null,
      error: err.message,
    });
  }
};


exports.getAllMilkProducts = async (req, res) => {
  try {
    const products = await milkProduct.find().populate("categoryId");
    res.json({
      success: true,
      message: "Milk products fetched successfully",
      data: products,
      error: null,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch milk products",
      data: null,
      error: err.message,
    });
  }
};

exports.getMilkProductById = async (req, res) => {
  try {
    const product = await milkProduct
      .findById(req.params.id)
      .populate("categoryId");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Milk product not found",
        data: null,
        error: null,
      });
    }

    res.json({
      success: true,
      message: "Milk product fetched successfully",
      data: product,
      error: null,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch milk product",
      data: null,
      error: err.message,
    });
  }
};

exports.getByCategoryId = async (req, res) => {
  try {
    const products = await milkProduct.find({
      categoryId: req.params.categoryId,
    });

    res.json({
      success: true,
      message: "Milk products by category fetched successfully",
      data: products,
      error: null,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch milk products by category",
      data: null,
      error: err.message,
    });
  }
};

exports.updateMilkProduct = async (req, res) => {
  try {
    const product = await milkProduct.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Milk product not found",
        data: null,
        error: null,
      });
    }

    const data = req.body;
    if (req.file) data.image = req.file.filename;

    const updated = await milkProduct.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });

    res.json({
      success: true,
      message: "Milk product updated successfully",
      data: updated,
      error: null,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update milk product",
      data: null,
      error: err.message,
    });
  }
};

exports.deleteMilkProduct = async (req, res) => {
  try {
    const deleted = await milkProduct.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Milk product not found",
        data: null,
        error: null,
      });
    }

    res.json({
      success: true,
      message: "Milk product deleted successfully",
      data: deleted,
      error: null,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete milk product",
      data: null,
      error: err.message,
    });
  }
};