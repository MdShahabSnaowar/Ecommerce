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

// routes/appointments.js  (or wherever your router.post("/appointments"... lives)

router.get("/appointments", async (req, res) => {
  try {
    const {
      userId,        // optional: filter by patient
      doctorId,      // optional: filter by doctor
      date,          // optional exact date (YYYY-MM-DD or ISO)
      from,          // optional start date (range)
      to,            // optional end date (range)
      status,        // optional: booked | completed | cancelled | etc.
      includeDoctor, // "true" to populate doctor
      includeUser,   // "true" to populate user
    } = req.query;

    const filter = {};

    if (userId) filter.userId = userId;
    if (doctorId) filter.doctorId = doctorId;
    if (status) filter.status = status;

    if (date) {
      // If you store dates as strings like "2025-07-21", match directly.
      // If stored as Date, you may want a midnight-to-midnight range:
      filter.date = date;
    } else if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = from;
      if (to) filter.date.$lte = to;
    }

    let query = Appointment.find(filter);

    // Optional population flags
    if (includeDoctor === "true") {
      query = query.populate("doctorId", "name specialty email phone");
    }
    if (includeUser === "true") {
      query = query.populate("userId", "name email phone");
    }

    // Sort newest first (customize as needed)
    query = query.sort({ date: -1, "slot.start": 1 });

    const appointments = await query.exec();

    return res.json({
      count: appointments.length,
      appointments,
    });
  } catch (err) {
    console.error("Get Appointments Error:", err);
    return res
      .status(500)
      .json({ message: "Server error fetching appointments" });
  }
});


module.exports = router;
