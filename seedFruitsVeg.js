const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Category = require("./models/FruitsVegCategory");
const Subcategory = require("./models/FruitsVegSubcategory");

const categories = [
  { name: "Fruits & Vegetables", slug: "fruits-and-vegetables" },
  { name: "Fresh Vegetables", slug: "fresh-vegetables" },
  { name: "Fresh Fruits", slug: "fresh-fruits" },
];

const subcategoryMap = {
  "Fruits & Vegetables": [
    { name: "₹29 & Below", image: "29-below.png" },
    { name: "Super Deals", image: "super-deals.png" },
    { name: "Seasonal", image: "seasonal.png" },
    { name: "Fruit of the Day", image: "fruit-day.png" },
    { name: "Combo Packs", image: "combo.png" },
  ],
  "Fresh Vegetables": [
    { name: "Tomatoes", image: "tomatoes.png" },
    { name: "Carrots", image: "carrots.png" },
    { name: "Potatoes", image: "potatoes.png" },
    { name: "Spinach", image: "spinach.png" },
    { name: "Onions", image: "onions.png" },
  ],
  "Fresh Fruits": [
    { name: "Apples", image: "apples.png" },
    { name: "Bananas", image: "bananas.png" },
    { name: "Oranges", image: "oranges.png" },
    { name: "Grapes", image: "grapes.png" },
    { name: "Pomegranates", image: "pomegranates.png" },
  ],
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to DB");

    await Category.deleteMany();
    await Subcategory.deleteMany();

    const createdCategories = await Category.insertMany(categories);

    for (const cat of createdCategories) {
      const subs = subcategoryMap[cat.name] || [];
      const subDocs = subs.map((sub) => ({
        ...sub,
        categoryId: cat._id,
      }));
      await Subcategory.insertMany(subDocs);
    }

    console.log("🌱 Seeding complete");
    process.exit();
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

seed();
