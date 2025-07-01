const mongoose = require("mongoose");

const fruitsVegCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FruitsVegCategory", fruitsVegCategorySchema);
