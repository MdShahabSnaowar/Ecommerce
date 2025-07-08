const express = require("express");
const router = express.Router();
const authUserOrAdmin = require("../middleware/authUserOrAdmin");
const catCtrl = require("../controllers/groceryCategoryController");
const authAdmin = require("../middleware/authAdmin");

router.post("/categories", authAdmin, catCtrl.createCategory);
router.get("/categories", catCtrl.getAllCategories);
router.get("/categories/:id", catCtrl.getCategoryById);
router.put("/categories/:id", authAdmin, catCtrl.updateCategory);
router.delete("/categories/:id", authAdmin, catCtrl.deleteCategory);

router.get("/with-subcategories",catCtrl.getCategoriesWithSubcategories);

module.exports = router;
