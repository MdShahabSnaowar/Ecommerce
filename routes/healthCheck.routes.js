const express = require("express");
const upload = require("../config/multer");
const {
  createHealthCheck,
  getAllHealthChecks,
  getHealthCheckById,
  updateHealthCheck,
  deleteHealthCheck,
} = require("../controllers/healthCheck.controller");

const router = express.Router();

// router.post("/create", createHealthCheck);
router.post(
  "/create",
  upload.single("image"), // 'image' should match the form-data key
  createHealthCheck
);
router.get("/", getAllHealthChecks);
router.get("/:id", getHealthCheckById);
router.put("/:id",
  
  upload.single("image"), // 'image' should match the form-data key
  
    updateHealthCheck);
router.delete("/:id", deleteHealthCheck);

module.exports = router;
