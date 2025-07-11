const mongoose = require("mongoose");

const filterGroceryProductSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GroceryProduct",
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FilterGroceryCategory",
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate product-category mappings
filterGroceryProductSchema.index({ productId: 1, categoryId: 1 }, { unique: true });

module.exports =
  mongoose.models.FilterGroceryProduct ||
  mongoose.model("FilterGroceryProduct", filterGroceryProductSchema);