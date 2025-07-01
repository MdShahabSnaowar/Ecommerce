const express = require("express");
const {
  createMedicalItem,
  getAllMedicalItems,
  getMedicalItemById,
  updateMedicalItem,
  deleteMedicalItem,
} = require("../controllers/medical.controllers");

const router = express.Router();

router.post("/create", createMedicalItem);
router.get("/", getAllMedicalItems);
router.get("/:id", getMedicalItemById);
router.put("/:id", updateMedicalItem);
router.delete("/:id", deleteMedicalItem);

module.exports = router;
