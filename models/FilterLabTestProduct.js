const mongoose = require("mongoose");

const filterLabTestProductSchema = new mongoose.Schema(
  {
    labTest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LabTest",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FilterLabTestCategory",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FilterLabTestProduct", filterLabTestProductSchema);