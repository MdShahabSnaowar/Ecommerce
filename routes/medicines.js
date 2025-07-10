const express = require("express");
const router = express.Router();

const {
  createMedicine,
  getAllMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  getProductsBySubcategory,
  getAllMedicineCategories,
  getSubcategoriesByCategoryId
} = require("../controllers/medicine.controllers");

const upload = require("../config/multer");
const authAdmin = require("../middleware/authAdmin");

router.post("/create", authAdmin, upload.single("image"), createMedicine);
router.get("/", getAllMedicines);


router.get("/categories", getAllMedicineCategories);

router.get("/:id", getMedicineById);
router.put("/:id", updateMedicine);
router.delete("/:id", deleteMedicine);

router.get("/subcategories/:categoryId", getSubcategoriesByCategoryId);
// ✅ Correct usage without undefined "medicine" variable
router.get("/products/subcategory/:subcategoryId", getProductsBySubcategory);

module.exports = router;
