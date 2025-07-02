const { Schema, default: mongoose } = require("mongoose");

const orderSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  products: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, default: 1 },
      priceAtPurchase: { type: Number, required: true }, // In case price changes later
    },
  ],
  status: {
    type: String,
    enum: ["shipped", "outfor delivery", "delivered", "cancelled"], 
    default: "shipped",
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
