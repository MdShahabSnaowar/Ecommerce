const express = require("express");
const router = express.Router();

const GroceryCategory = require("../models/GroceryCategory");
const GrocerySubCategory = require("../models/GrocerySubCategory");

const authUserOrAdmin = require("../middleware/authUserOrAdmin");
const catCtrl = require("../controllers/groceryCategoryController");
const authAdmin = require("../middleware/authAdmin");
const upload = require("../config/multer");

// router.post("/categories", authAdmin, catCtrl.createCategory);
router.post("/categories", authAdmin, upload.single("image"), catCtrl.createCategory);

router.get("/categories", catCtrl.getAllCategories);
router.get("/categories/:id", catCtrl.getCategoryById);
// router.put("/categories/:id", authAdmin, catCtrl.updateCategory);


// Express Router syntax
router.put(
  '/categories/:id',
  upload.single('image'), // Accepts optional single image
  async (req, res) => {
    try {
      let updateData = req.body;
      if (req.file) {
        updateData.image = '' + req.file.filename; // SIRF relative path store karo!
      }
      const category = await GroceryCategory.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );
      res.status(200).json({ message: "Category updated", data: category });
    } catch (err) {
      res.status(500).json({ message: "Error updating category", error: err.message });
    }
  }
);


router.delete("/categories/:id", authAdmin, catCtrl.deleteCategory);

router.get("/with-subcategories",catCtrl.getCategoriesWithSubcategories);

module.exports = router;
