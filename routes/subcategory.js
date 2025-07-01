const express = require("express");
const router = express.Router();
const {
  createSubCategory,
  getAllSubCategories,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
  getSubcategoriesByCategoryId,
} = require("../controllers/subcategory.controller");
const upload = require("../config/multer");

router.post("/create", upload.single("image"), createSubCategory);
router.get("/", getAllSubCategories);
router.get("/:id", getSubCategoryById);
router.put("/:id", upload.single("image"), updateSubCategory);

router.get("/category/:categoryId", getSubcategoriesByCategoryId);
router.delete("/:id", deleteSubCategory);

module.exports = router;
