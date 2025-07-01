const express = require("express");
const router = express.Router();

const category = require("../controllers/fruitsVegCategoryController");
const subcategory = require("../controllers/fruitsVegSubcategoryController");
const product = require("../controllers/fruitsVegProductController");
const upload = require("../config/multer");
const authAdmin = require("../middleware/authAdmin");


// 🥦 Category
router.post("/category",authAdmin, category.createCategory);
router.get("/category", category.getAllCategories);
router.get("/category/:id", category.getCategoryById);
router.put("/category/:id",authAdmin, category.updateCategory);
router.delete("/category/:id", authAdmin,category.deleteCategory);
router.get(
  "/categories/with-subcategories",
  authAdmin,category.getCategoriesWithSubcategories
);

// 🥕 Subcategory
router.post("/subcategory", authAdmin,upload.single("image"), subcategory.createSubcategory);
router.get("/subcategory", subcategory.getAllSubcategories);
router.get("/subcategory/:id", subcategory.getSubcategoryById);
router.put("/subcategory/:id", authAdmin,upload.single("image"), subcategory.updateSubcategory);
router.delete("/subcategory/:id", authAdmin,subcategory.deleteSubcategory);

// 🍎 Products
router.post("/product", authAdmin,upload.array("images", 5), product.createProduct);
router.get("/product", product.getAllProducts);
router.get("/product/:id", product.getProductById);
router.put("/product/:id",authAdmin, upload.array("images", 5), product.updateProduct);
router.delete("/product/:id", authAdmin,product.deleteProduct);
module.exports = router;
