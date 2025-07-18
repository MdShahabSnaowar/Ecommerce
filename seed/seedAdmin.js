const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");
dotenv.config(); // So we can use your .env variables like DB URL

const seedAdmin = async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const mobile = "9039636904";
    const password = "Vaibhav@123";
    const email = "admin@example.com";

    // Check if admin already exists
    const existingAdmin = await User.findOne({ mobile });
    if (existingAdmin) {
      console.log("ℹ️ Admin already exists:", existingAdmin._id.toString());
      return process.exit(0);
    }

    // Create new admin
    const admin = new User({
      name: "Vaibhav", 
      mobile,
      email,
      password, // will be hashed by pre-save hook
      role: "admin",
      isOtpVerified: true,
    });

    await admin.save();
    console.log("✅ Admin created successfully:", admin._id.toString());

    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding admin:", err);
    process.exit(1);
  }
};

seedAdmin();