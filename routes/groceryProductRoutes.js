const express = require("express");
const router = express.Router();

const productController = require("../controllers/groceryProductController");
const upload = require("../config/multer"); // ✅ correct multer path

router.post("/create", upload.single("image"), productController.createProduct);

// router.post("/create", upload.single("image"), (req, res, next) => {
//   console.log("POST /create called");
//   console.log("Request body:", req.body);
//   console.log("Uploaded file:", req.file);
//   next();
// }, productController.createProduct);

router.get("/get-all", productController.getAllProducts);
router.get("/get-by-id/:id", productController.getProductById);
router.get("/get-by-subcategory/:subcategoryId", productController.getProductsBySubcategory);


router.put("/update/:id", upload.single("image"), productController.updateProduct);
router.delete("/delete/:id", productController.deleteProduct);

module.exports = router;
