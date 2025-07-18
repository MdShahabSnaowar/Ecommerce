const mongoose = require("mongoose");

const medicineSubcategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MedicineCategory",
      required: true,
    },
    image:{type: String},
    description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MedicineSubcategory", medicineSubcategorySchema);