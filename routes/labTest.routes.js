const express = require("express");
const upload = require("../config/multer");
const {
  createLabTest,
  getAllLabTests,
  getLabTestById,
  updateLabTest,
  deleteLabTest,
  getLabTestsByHealthCheckId,
} = require("../controllers/labTest.controller");

const router = express.Router();

router.post("/create", upload.single("image"), createLabTest);
router.get("/", getAllLabTests);
router.get("/:id", getLabTestById);
router.put("/:id", upload.single("image"), updateLabTest);
router.delete("/:id", deleteLabTest);

router.get("/by-healthcheck/:healthCheckId", getLabTestsByHealthCheckId);
module.exports = router;
