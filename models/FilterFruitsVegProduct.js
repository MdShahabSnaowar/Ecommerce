const mongoose = require("mongoose");

const filterFruitsVegProductSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FruitsVegProduct",
      required: true,
    },
    subcategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FilterFruitsVegSubcategory",
      required: true,
    },
  },
  { timestamps: true }
);

// Add unique index to prevent duplicate product-subcategory mappings
filterFruitsVegProductSchema.index({ productId: 1, subcategoryId: 1 }, { unique: true });

// ✅ Correctly register and export the model
module.exports =
  mongoose.models.FilterFruitsVegProduct ||
  mongoose.model("FilterFruitsVegProduct", filterFruitsVegProductSchema);