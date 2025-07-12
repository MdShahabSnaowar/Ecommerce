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
    }
  ],
  status: {
    type: String,
    enum: ["OrderPlaced", "shipped", "outfor delivery", "delivered", "cancelled"],
    default: "OrderPlaced",
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
