const express = require("express");
const upload = require("../config/multer");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsBySubcategory,
} = require("../controllers/products.controllers");
const router = express.Router();

router.post("/create", upload.single("image"), createProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.put("/:id", upload.single("image"), updateProduct);
router.delete("/:id", deleteProduct);
router.get("/subcategory/:subcategoryId", getProductsBySubcategory);

module.exports = router;
