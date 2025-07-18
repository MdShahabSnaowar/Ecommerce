const express = require("express");
const router = express.Router();
const upload = require("../config/multer"); 

const subcatCtrl = require("../controllers/grocerySubcategoryController");

router.post("/create", upload.single("image"), subcatCtrl.createSubcategory);
router.get("/", subcatCtrl.getAllSubcategories);

router.get(
  "/by-category/:categoryId",
  subcatCtrl.getSubcategoriesByCategoryId
);
router.get("/get-by-id/:id", subcatCtrl.getSubcategoryById);
router.put("/update/:id", upload.single("image"), subcatCtrl.updateSubcategory);
router.delete("/delete/:id", subcatCtrl.deleteSubcategory);


module.exports = router;
