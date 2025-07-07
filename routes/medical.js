const express = require("express");
const {
  createMedicalItem,
  getAllMedicalItems,
  getMedicalItemById,
  updateMedicalItem,
  deleteMedicalItem,
} = require("../controllers/medical.controllers");

const router = express.Router();
const authAdmin = require("../middleware/authAdmin");

router.post("/create", authAdmin, createMedicalItem);
router.get("/", getAllMedicalItems);
router.get("/:id", getMedicalItemById);
router.put("/:id", updateMedicalItem);
router.delete("/:id", deleteMedicalItem);

module.exports = router;
