
const mongoose = require("mongoose");

const medicineProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MedicineCategory",
      required: true,
    },
    subcategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MedicineSubcategory",
      required: true,
    },
    price: { type: Number, required: true },
    mrp: { type: Number, min: 0 },
    discount: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    description: {
      type: String,
      trim: true,
      maxlength: 200000,
    },
    expiryDate: { type: Date },
    image: { type: String, default: "" },
    images: [{ type: String }], // ✅ NEW: For multiple images
  },
  { timestamps: true }
);

module.exports = mongoose.model("MedicineProduct", medicineProductSchema);