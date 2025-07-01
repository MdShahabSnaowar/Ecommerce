const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: false,
    },
    displayCategory: { type: String, default: "" },
    brand: { type: String, default: "" },
    name: { type: String, default: "" },
    tags: { type: String, default: "" },
    quantity: { type: String, default: "" },
    mrp: { type: String, default: "" },
    price: { type: String, default: "" },
    gst: { type: String, default: "" },
    metaTitle: { type: String, default: "" },
    metaKeywords: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    image: { type: String, default: null },
    details: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
