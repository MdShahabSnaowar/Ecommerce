const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String }, // image file name or URL
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    description: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubCategory", subCategorySchema);
