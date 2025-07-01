const express = require("express");
const router = express.Router();
const authAdmin = require("../middleware/authAdmin");
const upload = require("../config/multer");
const {
  createMilkProduct,
  getAllMilkProducts,
  getMilkProductById,
  getByCategoryId,
  updateMilkProduct,
  deleteMilkProduct,
} = require("../controllers/milkProduct.controller");

// Routes
router.post("/create", authAdmin,upload.single("image"), createMilkProduct);
router.get("/", getAllMilkProducts);
router.get("/:id", getMilkProductById);
router.get("/category/:categoryId", getByCategoryId);
router.put("/:id", authAdmin,upload.single("image"), updateMilkProduct);
router.delete("/:id",authAdmin,deleteMilkProduct);

module.exports = router;
