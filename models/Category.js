const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    route: { type: String, required: true },
    image: { type: String }, // Image path or URL
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
