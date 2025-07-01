const Product = require("../models/Products");

// Create
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      mrp,
      category,
      subcategory,
      description,
      quantity,
      details,
    } = req.body;

    const product = new Product({
      name,
      price,
      mrp,
      category,
      subcategory,
      description,
      quantity,
      details,
      image: req.file ? req.file.filename : null,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to create product", error });
  }
};

// Read All
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category")
      .populate("subcategory");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products", error });
  }
};

// Read One
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category")
      .populate("subcategory");

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product", error });
  }
};

// Update
exports.updateProduct = async (req, res) => {
  try {
    const updates = {
      ...req.body,
    };

    if (req.file) {
      updates.image = req.file.filename;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to update product", error });
  }
};

// Delete
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product", error });
  }
};

exports.getProductsBySubcategory = async (req, res) => {
  try {
    const { subcategoryId } = req.params;
    const products = await Product.find({ subcategory: subcategoryId })
      .populate("subcategory")
      .populate("category");
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products by subcategory:", error);
    res.status(500).json({ message: "Server error" });
  }
};
