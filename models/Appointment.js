const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    date: {
      type: String, // e.g. "2024-07-01"
      required: true,
    },
    slot: {
      start: { type: String, required: true }, // e.g. "09:00 AM"
      end: { type: String, required: true },   // e.g. "10:00 AM"
    },
    status: {
      type: String,
      enum: ["booked", "cancelled", "completed"],
      default: "booked",
    },
    reason: { type: String }, // optional reason or note
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
