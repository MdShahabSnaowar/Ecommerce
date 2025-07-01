const express = require("express");
const { redeemAtCheckout } = require("../controllers/supercoins.controllers");
const {
  getCoins,
  redeemCoins,
  addCoins,
} = require("../controllers/supercoins.controllers");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// ✅ GET user's coin balance and history
router.get("/", authMiddleware, getCoins);

// ✅ POST: redeem coins
router.post("/redeem", authMiddleware, redeemCoins);

// ✅ POST: add coins manually (admin or internal logic)
// Can also secure this route with an isAdmin middleware
router.post("/add", authMiddleware, addCoins);


router.post("/redeem-at-checkout", authMiddleware, redeemAtCheckout);

module.exports = router;
