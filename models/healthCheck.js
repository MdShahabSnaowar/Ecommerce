const mongoose = require("mongoose");

const healthCheckSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    icon: { type: String }, // URL or path to the icon/image
    createdByDoctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    }, // Optional if created by doctor
  },
  { timestamps: true }
);

module.exports = mongoose.model("HealthCheck", healthCheckSchema);
