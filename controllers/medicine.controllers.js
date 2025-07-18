// const Medicine = require("../models/MedicineProduct");
const MedicineProduct = require("../models/MedicineProduct");

const MedicineCategory = require("../models/MedicineCategory");
const MedicineSubcategory = require("../models/MedicineSubcategory");

// Create
exports.createMedicine = async (req, res) => {
  try {
    const image = req.file ? `${req.file.filename}` : "";
    const medicine = await MedicineProduct.create({ ...req.body, image });

    res.status(201).json({ success: true, data: medicine });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message.includes("mrp") ? "Invalid MRP value" : err.message,
    });
  }
};

// Read all
exports.getAllMedicines = async (req, res) => {
  try {
    const medicines = await MedicineProduct.find().sort({ createdAt: -1 });
    res.json({ success: true, data: medicines });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Read one
exports.getMedicineById = async (req, res) => {
  try {
    const medicine = await MedicineProduct.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    res.json({ success: true, data: medicine });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update
exports.updateMedicine = async (req, res) => {
  try {
    const image = req.file ? `${req.file.filename}` : undefined;
    const updateData = { ...req.body };
    if (image) updateData.image = image;

    const medicine = await MedicineProduct.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!medicine) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true, data: medicine });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete
exports.deleteMedicine = async (req, res) => {
  try {
    const medicine = await MedicineProduct.findByIdAndDelete(req.params.id);
    if (!medicine) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};




exports.getProductsBySubcategory = async (req, res) => {
  try {
    const { subcategoryId } = req.params;

    if (!subcategoryId) {
      return res.status(400).json({ success: false, message: "Subcategory ID is required" });
    }

    const products = await MedicineProduct.find({ subcategoryId })
      .populate("subcategoryId", "name")
      .populate("categoryId", "name");

    if (products.length === 0) {
      return res.status(404).json({ success: false, message: "No products found in this subcategory" });
    }

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (err) {
    console.error("Error fetching products by subcategory:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// ✅ GET /api/medicines/categories - All Categories
exports.getAllMedicineCategories = async (req, res) => {
  try {
    const categories = await MedicineCategory.find().sort({ name: 1 });
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ GET /api/medicines/subcategories/:categoryId - Subcategories by Category
exports.getSubcategoriesByCategoryId = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const subcategories = await MedicineSubcategory.find({ categoryId }).sort({ name: 1 });

    if (!subcategories.length) {
      return res.status(404).json({ success: false, message: "No subcategories found" });
    }

    res.status(200).json({ success: true, data: subcategories });
  } catch (err) {
    console.error("Error fetching subcategories:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};





exports.createMedicineProduct = async (req, res) => {
  try {
    const {
      name, brand, subcategoryId, price, mrp, discount, stock, description, expiryDate
      // ...other fields as needed
    } = req.body;

    // 1. Find the subcategory to get its categoryId
    const subcategory = await MedicineSubcategory.findById(subcategoryId);
    if (!subcategory) {
      return res.status(400).json({ success: false, message: 'Invalid subcategoryId' });
    }

    // 2. Use subcategory.categoryId for the product's categoryId
    const categoryId = subcategory.categoryId;

    // 3. Prepare product data (including images if using multer/multi-upload)
    const images = req.files?.images?.map(f => '' + f.filename) || [];
    const image = req.files?.image?.[0] ? '' + req.files.image[0].filename : "";

    // 4. Create the product
    const product = await MedicineProduct.create({
      name,
      brand,
      categoryId,        // <-- set from subcategory
      subcategoryId,
      price,
      mrp,
      discount,
      stock,
      description,
      expiryDate,
      image,
      images
    });

    res.status(201).json({
      success: true,
      message: "Medicine product created successfully",
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating medicine product",
      error: error.message
    });
  }
};
