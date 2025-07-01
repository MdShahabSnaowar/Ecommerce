const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One active subscription per user
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },
    paymentId: { type: String },
  },
  { timestamps: true }
);

// Optional: Auto-expire subscription
subscriptionSchema.pre("save", function (next) {
  const currentDate = new Date();
  if (this.endDate < currentDate) {
    this.isActive = false;
  }
  next();
});

module.exports = mongoose.model("Subscription", subscriptionSchema);
