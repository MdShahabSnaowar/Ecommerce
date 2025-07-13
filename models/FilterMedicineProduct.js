// models/FilterMedicineProduct.js
const mongoose = require("mongoose");
const filterMedicineProductSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MedicineProduct",
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FilterMedicine",
      required: true,
    },
  },
  { timestamps: true }
);

filterMedicineProductSchema.index({ productId: 1, categoryId: 1 }, { unique: true });

module.exports =
  mongoose.models.FilterMedicineProduct ||
  mongoose.model("FilterMedicineProduct", filterMedicineProductSchema);
