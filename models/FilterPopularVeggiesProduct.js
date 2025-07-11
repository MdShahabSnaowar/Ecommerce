const mongoose = require("mongoose");

const filterPopularVeggiesProductSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FruitsVegProduct",
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FilterPopularVeggies",
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate product-category mappings
filterPopularVeggiesProductSchema.index({ productId: 1, categoryId: 1 }, { unique: true });

module.exports =
  mongoose.models.FilterPopularVeggiesProduct ||
  mongoose.model("FilterPopularVeggiesProduct", filterPopularVeggiesProductSchema);