const mongoose = require("mongoose");

const milkUserSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    eligible: {
      type: Boolean,
      default: false,
    },
    membershipPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
    },
    accessGrantedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MilkUser", milkUserSchema);
