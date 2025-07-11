const mongoose = require("mongoose");

const milkProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: {
    type: String, 
    default: "Litre",
  },
  price: { type: Number, required: true },
  mrp: {
    type: Number,
    required: false,
    min: [0, "MRP must be non-negative"],
  },
  deliveryTime: { type: String, default: "11 MINS" },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MilkCategory",
    required: true,
  },
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model("MilkProduct", milkProductSchema);