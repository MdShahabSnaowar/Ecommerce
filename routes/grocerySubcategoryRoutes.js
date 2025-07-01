const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const subcatCtrl = require("../controllers/grocerySubcategoryController");

router.post("/create", upload.single("image"), subcatCtrl.createSubcategory);
router.get("/get-all", subcatCtrl.getAllSubcategories);
router.get("/get-by-id/:id", subcatCtrl.getSubcategoryById);
router.put("/update/:id", upload.single("image"), subcatCtrl.updateSubcategory);
router.delete("/delete/:id", subcatCtrl.deleteSubcategory);

module.exports = router;
