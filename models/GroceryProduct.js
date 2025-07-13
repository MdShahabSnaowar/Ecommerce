const mongoose = require("mongoose");

const groceryProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be non-negative"],
    },
    mrp: {
      type: Number,
      required: false,
      min: [0, "MRP must be non-negative"],
    },
    brand: {
      type: String,
      trim: true,
      default: "Generic",
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock must be 0 or more"],
    },
    image: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 15000,
    },
    unit: {
      type: String,
     
      default: "piece",
    },
    subcategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GrocerySubcategory",
      required: [true, "Subcategory ID is required"],
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("GroceryProduct", groceryProductSchema);
