const express = require("express");
const router = express.Router();

const productController = require("../controllers/groceryProductController");
const upload = require("../config/multer"); // ✅ correct multer path

router.post("/create", upload.array("images", 5), productController.createProduct);

// router.post("/create", upload.single("image"), (req, res, next) => {
//   console.log("POST /create called");
//   console.log("Request body:", req.body);
//   console.log("Uploaded file:", req.file);
//   next();
// }, productController.createProduct);

router.get("/", productController.getAllProducts);
router.get("/get-by-id/:id", productController.getProductById);
router.get("/:subcategoryId", productController.getProductsBySubcategory);


router.put("/:id",upload.array("images", 5), productController.updateProduct);
router.delete("/delete/:id", productController.deleteProduct);

module.exports = router;
