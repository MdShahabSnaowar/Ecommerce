const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");
dotenv.config(); // So we can use your .env variables like DB URL

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);


    const mobile = "9999999999";
    const password = "admin123";
    const email = "admin@example.com";

    // Check if admin already exists
    const existingAdmin = await User.findOne({ mobile });
    if (existingAdmin) {
    //   console.log("✅ Admin already exists:", existingAdmin._id.toString());
      return process.exit(0);
    }

    // Create new admin
    const admin = new User({
      mobile,
      email,
      password, // Will be hashed by pre-save hook
      role: "admin",
      isOtpVerified: true,
    });

    await admin.save();
    // console.log("✅ Admin created successfully:", admin._id.toString());

    process.exit(0);
  } catch (err) {
    // console.error("❌ Error seeding admin:", err);
    process.exit(1);
  }
};

seedAdmin();
