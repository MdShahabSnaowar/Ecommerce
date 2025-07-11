const express = require("express");
const router = express.Router();
const authAdmin = require("../middleware/authAdmin");
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  createProductFilter,
  getProductFilters,
  updateProductFilter,
  deleteProductFilter,
  getProductsByCategory,
} = require("../controllers/filterController");

// FilterLabTestCategory routes
router.post("/categories", authAdmin, createCategory);
router.get("/categories", getCategories);
router.put("/categories/:id", authAdmin, updateCategory);
router.delete("/categories/:id", authAdmin, deleteCategory);


// FilterLabTestProduct routes
router.post("/products", authAdmin, createProductFilter);
router.get("/products", getProductFilters);
router.put("/products/:id", authAdmin, updateProductFilter);
router.delete("/products/:id", authAdmin, deleteProductFilter);
router.get("/products/category/:categoryId", getProductsByCategory);

module.exports = router;