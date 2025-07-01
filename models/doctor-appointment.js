const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    image: { type: String }, // optional for future icon support
  },
  { timestamps: true }
);

module.exports = mongoose.model("Department", departmentSchema);
