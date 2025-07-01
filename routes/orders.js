const express = require("express");
const {
  getAllOrders,
  getMyOrders,
} = require("../controllers/orders.controller");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// GET /api/orders - Get all orders for current user or all (admin)
router.get("/", authMiddleware, getAllOrders);
router.get("/my", authMiddleware, getMyOrders);

module.exports = router;
