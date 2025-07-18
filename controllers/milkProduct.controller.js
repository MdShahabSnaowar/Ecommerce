const milkProduct = require("../models/MilkProduct");

exports.createMilkProduct = async (req, res) => {
  try {
    const { name, quantity, unit, price, categoryId, mrp } = req.body;

    // Gather all image filenames
    const images = req.files && req.files.length
      ? req.files.map(file => file.filename)
      : [];

    // Optionally, set the first image as 'image' (main display), or handle as per your app logic
    const image = images.length > 0 ? images[0] : null;

    if (!name || !quantity || !unit || !price || !categoryId || !image) {
      return res.status(400).json({
        success: false,
        message: "All fields including at least one image are required",
        data: null,
        error: null,
      });
    }

    // Use the model key names
    const product = new milkProduct({
      name,
      image,      // first image as main image
      images,     // all images for product
      quantity,
      unit,
      price,
      categoryId,
      mrp,
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

    const data = { ...req.body };

    // ✅ For multiple images
    if (req.files?.length) {
      data.images = req.files.map((file) => `${file.filename}`);
    }

    // Optional: if a single 'image' is also sent (backward compatibility)
    if (req.file) {
      data.image = `uploads/${req.file.filename}`;
    }

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