const mongoose = require("mongoose");

const grocerySubcategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: String,
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GroceryCategory",
    required: true,
  },
});

module.exports = mongoose.model("GrocerySubcategory", grocerySubcategorySchema);
