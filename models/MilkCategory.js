const mongoose = require("mongoose");

const milkCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String },
  image: { type: String, required: true }, // store image path
  rating: { type: Number, default: 0 },
});

module.exports = mongoose.model("MilkCategory", milkCategorySchema);
