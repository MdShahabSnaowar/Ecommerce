const mongoose = require("mongoose");

const dairyProductSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MilkProduct",
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DairyCategory",
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate product-category mappings
dairyProductSchema.index({ productId: 1, categoryId: 1 }, { unique: true });

module.exports =
  mongoose.models.DairyProduct ||
  mongoose.model("DairyProduct", dairyProductSchema);