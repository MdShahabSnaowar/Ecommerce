const express = require("express");
const router = express.Router();

const catCtrl = require("../controllers/groceryCategoryController");
const authAdmin = require("../middleware/authAdmin");

router.post("/category", authAdmin, catCtrl.createCategory);
router.get("/category", catCtrl.getAllCategories);
router.get("/category/:id", catCtrl.getCategoryById);
router.put("/category/:id", authAdmin, catCtrl.updateCategory);
router.delete("/category/:id", authAdmin, catCtrl.deleteCategory);

router.get("/with-subcategories",catCtrl.getCategoriesWithSubcategories);

module.exports = router;
