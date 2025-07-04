const mongoose = require("mongoose");

const fruitsVegProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    images: [
      {
        type: String,
        // required: true,
      },
    ],
    subcategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FruitsVegSubcategory",
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    mrp: {
      type: Number,
      required: false,  // <‑‑ not mandatory
    },
    unit: {
      type: String,
      enum: ["kg", "gm", "piece", "bunch", "dozen", "pack"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    isOrganic: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
    },
    origin: {
      type: String, // e.g., "India", "Imported", "Local Farm"
    },
    availability: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FruitsVegProduct", fruitsVegProductSchema);
