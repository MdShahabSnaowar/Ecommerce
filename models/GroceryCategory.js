const mongoose = require("mongoose");

const groceryCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  image: { type: String },
});

module.exports = mongoose.model("GroceryCategory", groceryCategorySchema);
