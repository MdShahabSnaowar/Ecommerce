const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Medicine = require("./models/medicines");

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce";

const seedMedicines = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    await Medicine.deleteMany();

    const medicines = [
      {
        name: "Paracetamol 500mg",
        brand: "Cipla",
        category: "Tablet",
        price: 30,
        discount: 10,
        stock: 100,
        description: "Used to reduce fever and relieve mild to moderate pain.",
        expiryDate: new Date("2026-06-30"),
        image: "/uploads/medicines/paracetamol.png",
      },
      {
        name: "Dolo 650",
        brand: "Micro Labs",
        category: "Tablet",
        price: 35,
        discount: 5,
        stock: 80,
        description:
          "Pain reliever and fever reducer. Common in viral infections.",
        expiryDate: new Date("2025-12-31"),
        image: "/uploads/medicines/dolo650.png",
      },
      {
        name: "Benadryl Cough Syrup",
        brand: "J&J",
        category: "Syrup",
        price: 90,
        discount: 15,
        stock: 50,
        description: "Used to relieve cough and throat irritation.",
        expiryDate: new Date("2025-08-15"),
        image: "/uploads/medicines/benadryl.png",
      },
      {
        name: "Vitamin C Injection",
        brand: "Zydus",
        category: "Injection",
        price: 120,
        discount: 10,
        stock: 20,
        description: "Boosts immunity and treats vitamin C deficiency.",
        expiryDate: new Date("2026-01-20"),
        image: "/uploads/medicines/vitaminC.png",
      },
      {
        name: "Skin Ointment",
        brand: "Himalaya",
        category: "Ointment",
        price: 70,
        discount: 5,
        stock: 60,
        description: "Used for skin rashes, itching, and dryness.",
        expiryDate: new Date("2026-03-10"),
        image: "/uploads/medicines/ointment.png",
      },
    ];

    const inserted = await Medicine.insertMany(medicines);
    console.log(`✅ Inserted ${inserted.length} medicines`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
};

seedMedicines();
