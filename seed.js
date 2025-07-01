// seed.js
const mongoose = require("mongoose");
const Category = require("./models/Category");

const MONGO_URI = "mongodb://localhost:27017/ahpi";

const seedCategories = [
  {
    title: "Medicine",
    route: "/MedicineHealthcare",
    image: "medicine.jpg",
  },
  {
    title: "Grocery",
    route: "/Grocery",
    image: "grocery.jpg",
  },
  {
    title: "Fruits and Vegetables",
    route: "/fruitsandvegetables",
    image: "fruits.jpg",
  },
  {
    title: "Milk",
    route: "/MilkProducts",
    image: "milk.jpg",
  },
];

async function seedDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected...");

    await Category.deleteMany(); // Clear old data
    console.log("Old categories deleted");

    await Category.insertMany(seedCategories);
    console.log("New categories seeded");

    mongoose.disconnect();
  } catch (err) {
    console.error("Seeding error:", err);
  }
}

seedDB();
