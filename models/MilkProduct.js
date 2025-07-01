// javascript
const mongoose = require("mongoose");

const milkProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, enum: ["Litre", "ml"], default: "Litre" },
  price: { type: Number, required: true },
  deliveryTime: { type: String, default: "11 MINS" },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MilkCategory",
    required: true,
  },
});

module.exports = mongoose.model("MilkProduct", milkProductSchema);
