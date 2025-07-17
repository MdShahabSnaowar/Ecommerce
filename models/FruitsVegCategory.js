const mongoose = require("mongoose");

const fruitsVegCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String},
    image: { type: String }, 
  },
  { timestamps: true }
);

module.exports = mongoose.model("FruitsVegCategory", fruitsVegCategorySchema);
