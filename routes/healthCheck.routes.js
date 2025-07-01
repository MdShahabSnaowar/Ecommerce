const express = require("express");
const {
  createHealthCheck,
  getAllHealthChecks,
  getHealthCheckById,
  updateHealthCheck,
  deleteHealthCheck,
} = require("../controllers/healthCheck.controller");

const router = express.Router();

router.post("/create", createHealthCheck);
router.get("/", getAllHealthChecks);
router.get("/:id", getHealthCheckById);
router.put("/:id", updateHealthCheck);
router.delete("/:id", deleteHealthCheck);

module.exports = router;
