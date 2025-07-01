const mongoose = require("mongoose");

const superCoinSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    coins: {
      type: Number,
      default: 0,
    },
    history: [
      {
        type: {
          type: String,
          enum: ["registration", "referral", "purchase", "redeem", "expired"],
        },
        coins: Number,
        description: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
        expiresAt: Date, // Only for earned coins
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("SuperCoin", superCoinSchema);
