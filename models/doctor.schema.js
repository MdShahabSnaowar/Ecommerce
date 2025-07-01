const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String }, // Optional profile image
    specialization: { type: [String] }, // e.g., ["Neurosurgeon"]
    degrees: { type: String }, // e.g., "MBBS, MS - General Surgery"

    experience: { type: Number, required: true }, // Total years of experience

    rating: { type: Number, default: 4.5 },
    reviewCount: { type: Number, default: 0 },

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    clinic: {
      address: { type: String, required: true },
    },

    availability: [
      {
        day: {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
        },
        slots: [
          {
            start: { type: String }, // e.g., "09:00 AM"
            end: { type: String }, // e.g., "11:00 AM"
          },
        ],
      },
    ],

    fee: { type: Number, required: true },
    description: { type: String }, // Short bio / about the doctor

    isProfileClaimed: { type: Boolean, default: true },
    isMedicalVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
