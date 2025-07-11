const mongoose = require("mongoose");

const filterGroceryCategorySchema = new mongoose.Schema(
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

module.exports = mongoose.model("FilterGroceryCategory", filterGroceryCategorySchema);