// models/Payment.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const paymentSchema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    signature: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    // currency: {
    //   type: String,
    //   default: "USD",
    //   enum: ["USD", "EUR", "INR", "GBP", "JPY", "CNY"],
    // },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
