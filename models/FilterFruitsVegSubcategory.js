const mongoose = require("mongoose");

const filterFruitsVegSubcategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FilterFruitsVegCategory",
      required: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FilterFruitsVegSubcategory", filterFruitsVegSubcategorySchema);