const { Schema, default: mongoose } = require("mongoose");

const orderSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, required: true },
      name: String,
      image: String,
      quantity: Number,
      priceAtPurchase: Number,
      productType: String,
    }
  ],
  status: {
    type: String,
    enum: [
      "OrderPlaced",
      "shipped",
      "outfor delivery",
      "delivered",
      "cancelled",
      "exchange_requested",
      "exchange_in_transit",
      "exchanged",
      "return_requested",
      "returned"
    ],
    default: "OrderPlaced",
  },

  deliveredAt: {
    type: Date,
    default: null
  },
    exchangeReason: {
    type: String,
    default: null
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  deliveryAddress: {
    type: Object,
    required: true,
  },
  paymentId: {
    type: Schema.Types.ObjectId,
    ref: "Payment",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
