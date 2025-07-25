const express = require("express");
const authAdmin = require("../middleware/authAdmin");
const authUserOrAdmin = require("../middleware/authUserOrAdmin");
const {
  getAllOrders,
  getMyOrders,
  updateOrderStatus
} = require("../controllers/orders.controller");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// GET /api/orders - Get all orders for current user or all (admin)
router.get("/", authAdmin, getAllOrders);
router.get("/my", authMiddleware, getMyOrders);

router.patch("/status/:orderId", authUserOrAdmin, updateOrderStatus);

module.exports = router;
