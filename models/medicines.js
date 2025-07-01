const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true },
    category: {
      type: String,
      enum: ["Tablet", "Syrup", "Injection", "Ointment", "Other"],
      default: "Other",
    },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    description: { type: String },
    expiryDate: { type: Date },
    image: { type: String, default: "" }, // added field
  },
  { timestamps: true }
);

module.exports = mongoose.model("Medicine", medicineSchema);
