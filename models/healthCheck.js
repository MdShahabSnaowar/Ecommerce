const mongoose = require("mongoose");

const healthCheckSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    image: { type: String }, // image path (optional)
    createdByDoctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HealthCheck", healthCheckSchema);
