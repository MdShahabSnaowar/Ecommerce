const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const HealthCheck = require("./models/healthCheck");
const LabTest = require("./models/labtest");

const healthCheckData = [
  {
    title: "Basic Full Body Checkup",
    description: "Covers essential health markers",
  },
  {
    title: "Diabetes Screening",
    description: "Tests for glucose & insulin control",
  },
  {
    title: "Heart Risk Assessment",
    description: "Cholesterol, ECG & cardiac health",
  },
  { title: "Thyroid Checkup", description: "TSH, T3, T4 monitoring" },
  {
    title: "Liver Function Test",
    description: "Evaluates liver health & enzymes",
  },
];

const generateLabTests = (healthCheckId) => [
  {
    name: "Blood Sugar (Fasting)",
    includedTests: 1,
    price: 200,
    mrp: 300,
    discountPercentage: 33,
    location: "Bhopal",
    description: "Fasting glucose level test",
    healthCheck: healthCheckId,
  },
  {
    name: "Lipid Profile",
    includedTests: 5,
    price: 450,
    mrp: 600,
    discountPercentage: 25,
    location: "Indore",
    description: "Complete cholesterol panel",
    healthCheck: healthCheckId,
  },
  {
    name: "Liver Enzyme Test",
    includedTests: 3,
    price: 350,
    mrp: 500,
    discountPercentage: 30,
    location: "Bhopal",
    description: "SGOT, SGPT, Bilirubin levels",
    healthCheck: healthCheckId,
  },
  {
    name: "Thyroid Panel",
    includedTests: 3,
    price: 400,
    mrp: 550,
    discountPercentage: 27,
    location: "Bhopal",
    description: "TSH, T3, T4 analysis",
    healthCheck: healthCheckId,
  },
];

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // Cleanup
    await HealthCheck.deleteMany();
    await LabTest.deleteMany();
    console.log("🧹 Old data cleared");

    // Insert HealthChecks
    const insertedHealthChecks = await HealthCheck.insertMany(healthCheckData);
    console.log("📁 5 HealthChecks inserted");

    // Insert LabTests (4 per health check)
    for (const check of insertedHealthChecks) {
      const labTests = generateLabTests(check._id);
      await LabTest.insertMany(labTests);
    }

    console.log("📁 20 LabTests inserted (4 for each category)");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seedData();
