const mongoose = require("mongoose");
const dotenv = require("dotenv");
const HealthCheck = require("./models/healthCheck");
const LabTest = require("./models/labtest");

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce";

const seedLabTests = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    // Clean existing
    await HealthCheck.deleteMany();
    await LabTest.deleteMany();

    // Seed HealthChecks
    const healthChecksData = [
      { title: "Full Body Checkup", icon: "/icons/full_body_checkup.png" },
      { title: "Diabetes", icon: "/icons/diabetes.png" },
      { title: "Women's Health", icon: "/icons/women_health.png" },
      { title: "Thyroid", icon: "/icons/thyroid.png" },
    ];

    const insertedHealthChecks = await HealthCheck.insertMany(healthChecksData);
    console.log(`✅ Inserted ${insertedHealthChecks.length} health checks`);

    const labTestsData = [];

    insertedHealthChecks.forEach((check) => {
      if (check.title === "Full Body Checkup") {
        labTestsData.push(
          {
            name: "CBC (Complete Blood Count)",
            includedTests: 24,
            price: 350,
            mrp: 700,
            discountPercentage: 50,
            image: "/images/cbc.png",
            healthCheck: check._id,
          },
          {
            name: "Liver Function Test (LFT)",
            includedTests: 11,
            price: 480,
            mrp: 960,
            discountPercentage: 50,
            image: "/images/lft.png",
            healthCheck: check._id,
          }
        );
      }

      if (check.title === "Diabetes") {
        labTestsData.push(
          {
            name: "HbA1c Test",
            includedTests: 1,
            price: 510,
            mrp: 850,
            discountPercentage: 40,
            image: "/images/hba1c.png",
            healthCheck: check._id,
          },
          {
            name: "Fasting Blood Sugar (FBS)",
            includedTests: 1,
            price: 80,
            mrp: 133,
            discountPercentage: 40,
            image: "/images/fbs.png",
            healthCheck: check._id,
          }
        );
      }

      if (check.title === "Women's Health") {
        labTestsData.push(
          {
            name: "Hormonal Profile",
            includedTests: 5,
            price: 990,
            mrp: 1600,
            discountPercentage: 38,
            image: "/images/hormone.png",
            healthCheck: check._id,
          },
          {
            name: "Calcium Test",
            includedTests: 1,
            price: 200,
            mrp: 400,
            discountPercentage: 50,
            image: "/images/calcium.png",
            healthCheck: check._id,
          }
        );
      }

      if (check.title === "Thyroid") {
        labTestsData.push(
          {
            name: "TSH Test",
            includedTests: 1,
            price: 170,
            mrp: 300,
            discountPercentage: 43,
            image: "/images/tsh.png",
            healthCheck: check._id,
          },
          {
            name: "T3 T4 Test",
            includedTests: 2,
            price: 350,
            mrp: 600,
            discountPercentage: 41,
            image: "/images/t3t4.png",
            healthCheck: check._id,
          }
        );
      }
    });

    const insertedLabTests = await LabTest.insertMany(labTestsData);
    console.log(`✅ Inserted ${insertedLabTests.length} lab tests`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err.message);
    process.exit(1);
  }
};

seedLabTests();
