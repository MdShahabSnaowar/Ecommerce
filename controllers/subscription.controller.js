const crypto = require("crypto");
const razorpay = require("../config/razorpay"); // instance you configured
const Plan = require("../models/planSchema");
const Subscription = require("../models/subscriptionSchema");

exports.createSubscriptionOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: "planId is required",
        data: null,
        error: null,
      });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
        data: null,
        error: null,
      });
    }

    const options = {
      amount: plan.price * 100,
      currency: "INR",
      receipt: `subscription_${Date.now()}`,
      notes: {
        userId,
        planId,
        type: "plan",
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.status(201).json({
      success: true,
      message: "Razorpay order created for subscription",
      data: { razorpayOrder },
      error: null,
    });
  } catch (err) {
    console.error("Subscription Razorpay error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create Razorpay order",
      data: null,
      error: err.message,
    });
  }
};

exports.verifyAndActivateSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
        data: null,
        error: null,
      });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
        data: null,
        error: null,
      });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + plan.durationInDays);

    const existing = await Subscription.findOne({ userId });
    if (existing) await existing.deleteOne();

    const subscription = await Subscription.create({
      userId,
      planId,
      startDate,
      endDate,
      status: "active",
      paymentId: razorpay_payment_id,
    });

    res.status(201).json({
      success: true,
      message: "Subscription activated successfully",
      data: subscription,
      error: null,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to verify and activate subscription",
      data: null,
      error: err.message,
    });
  }
};
