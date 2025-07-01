const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product", // Optional, in case it's a store purchase
        },
        quantity: Number,
        price: Number,
      },
    ],
    type: {
      type: String,
      enum: ["subscription", "order", "other"],
      required: true,
    },
    amountPaid: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["razorpay", "upi", "card", "cash"],
    },
    transactionId: String,
    earnedCoins: {
      type: Number,
      default: 0,
    },
    redeemedCoins: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
