const express = require("express");
const router = express.Router();

const {
  createMedicine,
  getAllMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  getProductsBySubcategory,
  getAllMedicineCategories,
  getSubcategoriesByCategoryId
} = require("../controllers/medicine.controllers");
const MedicineCategory = require("../models/MedicineCategory");
const MedicineSubcategory = require("../models/MedicineSubcategory");
const upload = require("../config/multer");
const authAdmin = require("../middleware/authAdmin");






// Create Category
router.post("/category", upload.single("image"), async (req, res) => {
  try {
    const { name, description } = req.body;

    const existing = await MedicineCategory.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: "Category already exists" });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : undefined;

    const category = await MedicineCategory.create({ name, description, image });

    res.status(201).json({ success: true, message: "Category created", data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating category", error: error.message });
  }
});


// Get All Categories
router.get("/category", async (req, res) => {
  try {
    const categories = await MedicineCategory.find();
    res.status(200).json({ success: true, message: "Categories fetched", data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching categories", error: error.message });
  }
});

// Update Category
router.put("/category/:id", async (req, res) => {
  try {
    const category = await MedicineCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });
    res.status(200).json({ success: true, message: "Category updated", data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating category", error: error.message });
  }
});

// Delete Category
router.delete("/category/:id", async (req, res) => {
  try {
    const deleted = await MedicineCategory.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Category not found" });
    res.status(200).json({ success: true, message: "Category deleted", data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting category", error: error.message });
  }
});


// ------------------------ SUBCATEGORY CRUD ------------------------

// Create Subcategory
router.post("/subcategory", async (req, res) => {
  try {
    const { name, categoryId, description } = req.body;
    const subcategory = await MedicineSubcategory.create({ name, categoryId, description });
    res.status(201).json({ success: true, message: "Subcategory created", data: subcategory });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating subcategory", error: error.message });
  }
});

// Get All Subcategories
router.get("/subcategory", async (req, res) => {
  try {
    const subcategories = await MedicineSubcategory.find().populate("categoryId");
    res.status(200).json({ success: true, message: "Subcategories fetched", data: subcategories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching subcategories", error: error.message });
  }
});

// Update Subcategory
router.put("/subcategory/:id", async (req, res) => {
  try {
    const subcategory = await MedicineSubcategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!subcategory) return res.status(404).json({ success: false, message: "Subcategory not found" });
    res.status(200).json({ success: true, message: "Subcategory updated", data: subcategory });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating subcategory", error: error.message });
  }
});

// Delete Subcategory
router.delete("/subcategory/:id", async (req, res) => {
  try {
    const deleted = await MedicineSubcategory.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Subcategory not found" });
    res.status(200).json({ success: true, message: "Subcategory deleted", data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting subcategory", error: error.message });
  }
});


// ------------------------ PRODUCT CRUD ------------------------

// Create Product
router.post("/product", async (req, res) => {
  try {
    const product = await MedicineProduct.create(req.body);
    res.status(201).json({ success: true, message: "Product created", data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating product", error: error.message });
  }
});

// Get All Products
router.get("/product", async (req, res) => {
  try {
    const products = await MedicineProduct.find()
      .populate("categoryId")
      .populate("subcategoryId");
    res.status(200).json({ success: true, message: "Products fetched", data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching products", error: error.message });
  }
});

// Update Product

router.put(
  "/product/:id",
  upload.array("images", 5), // Accept up to 5 images under field name `images`
  async (req, res) => {
    try {
      const updateData = { ...req.body };

      if (req.files?.length) {
        updateData.images = req.files.map((file) => `uploads/${file.filename}`);
      }

      const product = await MedicineProduct.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      if (!product)
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });

      res.status(200).json({
        success: true,
        message: "Product updated",
        data: product,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating product",
        error: error.message,
      });
    }
  }
);
// Delete Product
router.delete("/product/:id", async (req, res) => {
  try {
    const deleted = await MedicineProduct.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, message: "Product deleted", data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting product", error: error.message });
  }
});




router.get("/categories-with-subcategories", async (req, res) => {
  try {
    // Step 1: Get all categories
    const categories = await MedicineCategory.find();

    // Step 2: For each category, fetch its subcategories
    const result = await Promise.all(
      categories.map(async (category) => {
        const subcategories = await MedicineSubcategory.find({
          categoryId: category._id,
        });

        return {
          _id: category._id,
          name: category.name,
          description: category.description,
          subcategories: subcategories.map((sub) => ({
            _id: sub._id,
            name: sub.name,
            description: sub.description,
          })),
        };
      })
    );

    return res.status(200).json({
      message: "Medicine categories with subcategories fetched successfully",
      data: result,
      error: false,
    });
  } catch (err) {
    console.error("❌ Error fetching categories with subcategories:", err);
    return res.status(500).json({
      message: "Something went wrong while fetching data",
      data: null,
      error: true,
    });
  }
});













router.post("/create", authAdmin, upload.single("image"), createMedicine);
router.get("/", getAllMedicines);


router.get("/categories", getAllMedicineCategories);

router.get("/:id", getMedicineById);
router.put("/:id", updateMedicine);
router.delete("/:id", deleteMedicine);

router.get("/subcategories/:categoryId", getSubcategoriesByCategoryId);
// ✅ Correct usage without undefined "medicine" variable
router.get("/products/subcategory/:subcategoryId", getProductsBySubcategory);

module.exports = router;
