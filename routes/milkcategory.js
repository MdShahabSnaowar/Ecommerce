// routes/milkCategoryRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/milkCategoryController");
const upload = require("../config/multer");
const authAdmin = require("../middleware/authAdmin");


router.post("/create", authAdmin,upload.single("image"), controller.createMilkCategory);
router.get("/", controller.getAllMilkCategories);
router.get("/:id", controller.getMilkCategoryById);
router.put("/:id", authAdmin,upload.single("image"), controller.updateMilkCategory);
router.delete("/:id",authAdmin,controller.deleteMilkCategory);
router.get("/category/:categoryId", controller.getProductsByMilkCategoryId);

module.exports = router;
