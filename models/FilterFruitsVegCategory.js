const mongoose = require("mongoose");

const filterFruitsVegCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FilterFruitsVegCategory", filterFruitsVegCategorySchema);