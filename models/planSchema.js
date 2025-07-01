const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    durationInDays: {
      type: Number,
      required: true, // e.g., 30, 90, 180
    },
    durationUnit: {
  type: String,
  enum: ['weeks', 'months', 'years'],
  required: true,
},
    benefits: {
      milkAccess: { type: Boolean, default: true },
      doctorConsultation: { type: Boolean, default: true },
      bloodTestDiscount: { type: Boolean, default: true },
      freeDeliveryAbove: { type: Number, default: 99 }, // ₹199 for non-members
      freeMilkTestingKit: { type: Boolean, default: true },
      medicineDiscount: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plan", planSchema);
