const express = require("express");
const router = express.Router();

const category = require("../controllers/fruitsVegCategoryController");
const subcategory = require("../controllers/fruitsVegSubcategoryController");
const product = require("../controllers/fruitsVegProductController");
const upload = require("../config/multer");
const authAdmin = require("../middleware/authAdmin");


// 🥦 Category
router.post("/categories",authAdmin, category.createCategory);
router.get("/categories", category.getAllCategories);
router.get("/categories/:id", category.getCategoryById);
router.put("/categories/:id",authAdmin, category.updateCategory);
router.delete("/categories/:id", authAdmin,category.deleteCategory);
router.get(
  "/categories/with-subcategories",
  authAdmin,category.getCategoriesWithSubcategories
);

// 🥕 Subcategory
router.post("/subcategories", authAdmin,upload.single("image"), subcategory.createSubcategory);
router.get("/subcategories", subcategory.getAllSubcategories);
router.get("/subcategories/:id", subcategory.getSubcategoryById);
router.put("/subcategories/:id", authAdmin,upload.single("image"), subcategory.updateSubcategory);
router.delete("/subcategories/:id", authAdmin,subcategory.deleteSubcategory);

// 🍎 Products
router.post("/product", authAdmin,upload.array("images", 5), product.createProduct);
router.get("/product", product.getAllProducts);
router.get("/product/:id", product.getProductById);
router.put("/product/:id",authAdmin, upload.array("images", 5), product.updateProduct);
router.delete("/product/:id", authAdmin,product.deleteProduct);
module.exports = router;
