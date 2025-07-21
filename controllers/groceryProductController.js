
const GroceryProduct = require("../models/GroceryProduct");
exports.createProduct = async (req, res) => {
  try {
    const { name, price, brand, stock, description, unit, subcategoryId, mrp } = req.body;

    // Process each file to get an array of image paths
    const images = req.files
      ? req.files.map(file => '' + file.filename)
      : [];

    const product = await GroceryProduct.create({
      name,
      price,
      brand,
      stock,
      description,
      unit,
      subcategoryId,
      mrp,
      images, // assign the array here
    });

    res.status(201).json({ message: "Product created", data: product });
  } catch (err) {
    res.status(500).json({ message: "Error creating product", error: err.message });
  }
};


exports.getAllProducts = async (req, res) => {
  try {
    const products = await GroceryProduct.find().populate("subcategoryId");
    res.status(200).json({ message: "Products fetched", data: products });
  } catch (err) {
    res.status(500).json({ message: "Error fetching products", error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await GroceryProduct.findById(req.params.id).populate("subcategoryId");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product fetched", data: product });
  } catch (err) {
    res.status(500).json({ message: "Error fetching product", error: err.message });
  }
};

exports.getProductsBySubcategory = async (req, res) => {
  try {
    const products = await GroceryProduct.find({ subcategoryId: req.params.subcategoryId }).lean(); // Convert Mongoose docs to plain JS

    // Ensure 'image' field exists in all products
    const updatedProducts = products.map(product => ({
      ...product,
      image: product.image || "", // if image is undefined/null, set it to empty string
    }));

    res.status(200).json({ message: "Products fetched", data: updatedProducts });
  } catch (err) {
    res.status(500).json({ message: "Error fetching products", error: err.message });
  }
};


exports.updateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Handle single 'image' upload
    if (req.files?.image && req.files.image.length > 0) {
      updateData.image = req.files.image[0].filename;
    }

    // Handle multiple 'images' upload
    if (req.files?.images && req.files.images.length > 0) {
      updateData.images = req.files.images.map((file) => file.filename);
    }

    const product = await GroceryProduct.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product updated",
      data: product,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error updating product",
      error: err.message,
    });
  }
};


exports.deleteProduct = async (req, res) => {
  try {
    await GroceryProduct.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting product", error: err.message });
  }
};
