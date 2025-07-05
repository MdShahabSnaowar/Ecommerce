// routes/payment.js
const express = require("express");
const planSchema = require("../models/planSchema");
const Razorpay = require("razorpay");
const router = express.Router();
const crypto = require("crypto");
const subscriptionSchema = require("../models/subscriptionSchema");
const authMiddleware = require("../middleware/authMiddleware");
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post("/subscribe", authMiddleware, async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user.id;

    const plan = await planSchema.findById(planId);
    if (!plan) return res.status(404).json({ error: "Plan not found" });
    const options = {
      amount: plan.price * 100, // INR to paise
      currency: "INR",
      receipt: `sub_rcpt_${Date.now()}`,
      notes: {
        userId,
        planId,
      },
    };

    console.log(options);
    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      razorpayOrder,
      planId,
    });
  } catch (err) {
    console.error("Subscription order error:", err.message);
    res.status(500).json({ error: "Subscription initiation failed" });
  }
});

router.post("/subscribe/verify", authMiddleware, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
    } = req.body;

    const userId = req.user.id;

    // ✅ Generate expected signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // ❌ Signature mismatch
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    // ✅ Fetch plan
    const plan = await planSchema.findById(planId);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    // ✅ Setup subscription dates using plan.durationInDays
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.durationInDays); // ✅ FIXED LINE

    // ✅ Create subscription record
    const subscription = new subscriptionSchema({
      userId,
      planId,
      startDate,
      endDate,
      status: "active",
      paymentId: razorpay_payment_id,
    });

    await subscription.save();

    // ✅ Respond with success
    res.json({
      success: true,
      message: "Subscription activated",
      subscription,
    });
  } catch (err) {
    console.error("Subscription verify error:", err.message);
    res
      .status(500)
      .json({ error: "Subscription verification failed", message: err });
  }
});
module.exports = router;
