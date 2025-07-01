// models/LabTest.js
const mongoose = require("mongoose");

const labTestSchema = new mongoose.Schema(
  {
    healthCheck: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HealthCheck",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: { type: String },
    includedTests: { type: Number, default: 1 },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    discountPercentage: { type: Number, default: 0 }, // e.g., 40
    location: { type: String, default: "Bhopal" },
    description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LabTest", labTestSchema);
