const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getAllSubscriptions,
  subscribeToPlan,
  getUserSubscription,
} = require("../controllers/subscription.controller");

const {
  createSubscriptionOrder,
  verifyAndActivateSubscription,
} = require("../controllers/subscription.controller");

const router = express.Router();



router.post("/subscribe-order", authMiddleware, createSubscriptionOrder);
router.post("/verify-subscription", authMiddleware, verifyAndActivateSubscription);


module.exports = router;
