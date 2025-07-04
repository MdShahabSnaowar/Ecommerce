const FruitsVegProduct = require("../models/FruitsVegProduct");

exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      subcategoryId,
      price,
      unit,
      quantity,
      isOrganic,
      description,
      origin,
      availability,
      mrp, // 👉 add mrp from req.body
    } = req.body;

    // ✅ Store clean paths like: uploads/image1.jpg
    const images = req.files?.map(file => `uploads/${file.filename}`) || [];

    const product = await FruitsVegProduct.create({
      name,
      subcategoryId,
      price,
      unit,
      quantity,
      isOrganic,
      description,
      origin,
      availability,
      mrp, // 👉 include mrp in product creation
      images,
    });

    res.status(201).json({
      message: "Product created successfully",
      data: product,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error creating product",
      error: err.message,
    });
  }
};



// exports.getAllProducts = async (req, res) => {
//   try {
//     const products = await FruitsVegProduct.find().populate("subcategoryId");
//     res.status(200).json({
//       message: "Products fetched successfully",
//       data: products,
//     });
//   } catch (err) {
//     res.status(500).json({
//       message: "Error fetching products",
//       error: err.message,
//     });
//   }
// };

exports.getAllProducts = async (req, res) => {
  try {
    const { name, subcategoryId, isOrganic, availability, origin } = req.query;

    // Build filter object dynamically
    const filter = {};

    if (name) {
      filter.name = { $regex: name, $options: "i" }; // case-insensitive partial match
    }

    if (subcategoryId) {
      filter.subcategoryId = subcategoryId;
    }

    if (isOrganic !== undefined) {
      filter.isOrganic = isOrganic === "true";
    }

    if (availability !== undefined) {
      filter.availability = availability === "true";
    }

    if (origin) {
      filter.origin = origin;
    }

    const products = await FruitsVegProduct.find(filter).populate("subcategoryId");

    res.status(200).json({
      message: "Products fetched successfully",
      data: products,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching products",
      error: err.message,
    });
  }
};


exports.getProductById = async (req, res) => {
  try {
    const product = await FruitsVegProduct.findById(req.params.id).populate("subcategoryId");

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product fetched successfully",
      data: product,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching product",
      error: err.message,
    });
  }
};


exports.updateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.files?.length) {
      updateData.images = req.files.map(file => `uploads/${file.filename}`);
    }

    const product = await FruitsVegProduct.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product updated successfully",
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
    await FruitsVegProduct.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting product", error: err.message });
  }
};
