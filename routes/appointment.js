const express = require("express");
const doctorSchema = require("../models/doctor.schema");
const Appointment = require("../models/Appointment");
const router = express.Router();

// POST /api/appointments
router.post("/appointments", async (req, res) => {
  try {
    const { userId, doctorId, date, slot, reason } = req.body;

    if (!userId || !doctorId || !date || !slot?.start || !slot?.end) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Optional: Check if doctor exists
    const doctor = await doctorSchema.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Optional: Prevent double booking for same doctor, same slot
    const isSlotTaken = await Appointment.findOne({
      doctorId,
      date,
      "slot.start": slot.start,
      "slot.end": slot.end,
      status: "booked",
    });

    if (isSlotTaken) {
      return res.status(409).json({ message: "This slot is already booked" });
    }

    const appointment = new Appointment({
      userId,
      doctorId,
      date,
      slot,
      reason,
    });

    await appointment.save();
    res.status(201).json({
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (err) {
    console.error("Booking Error:", err);
    res.status(500).json({ message: "Server error during booking" });
  }
});

module.exports = router;
