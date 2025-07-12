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
    image: {
      type: String, // Stores the filename or path
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FilterFruitsVegSubcategory", filterFruitsVegSubcategorySchema);