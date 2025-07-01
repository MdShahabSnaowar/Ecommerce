const mongoose = require("mongoose");

const fruitsVegSubcategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: String,
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FruitsVegCategory",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "FruitsVegSubcategory",
  fruitsVegSubcategorySchema
);
