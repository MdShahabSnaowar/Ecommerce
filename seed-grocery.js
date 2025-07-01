const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const GroceryCategory = require("./models/GroceryCategory");
const GrocerySubcategory = require("./models/GrocerySubCategory");
const GroceryProduct = require("./models/GroceryProduct");

// 📦 Sample Grocery Categories with Slugs
const categoryData = [
  { name: "Grocery & Kitchen", slug: "grocery-kitchen" },
  { name: "Snacks & Beverages", slug: "snacks-beverages" },
  { name: "Beauty & Personal Care", slug: "beauty-personal-care" },
];

// 🔗 Subcategories by Category Name
const subcategoryMap = {
  "Grocery & Kitchen": [
    "Atta, Rice & Dal",
    "Cooking Oil",
    "Masala & Spices",
    "Sugar & Jaggery",
    "Pulses",
  ],
  "Snacks & Beverages": [
    "Chips & Namkeen",
    "Biscuits",
    "Cold Drinks",
    "Juices",
  ],
  "Beauty & Personal Care": ["Face Wash", "Shampoo", "Body Lotion", "Soap"],
};

// 🛒 Sample product generator for each subcategory
const generateProducts = (subcategoryId, subcategoryName) => {
  return [
    {
      name: `${subcategoryName} Product 1`,
      price: Math.floor(Math.random() * 100) + 50,
      brand: "DemoBrand",
      stock: true,
      image: "", // image path optional
      subcategoryId,
    },
    {
      name: `${subcategoryName} Product 2`,
      price: Math.floor(Math.random() * 100) + 100,
      brand: "DemoBrand",
      stock: true,
      image: "",
      subcategoryId,
    },
  ];
};

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear previous data
    await GroceryProduct.deleteMany();
    await GrocerySubcategory.deleteMany();
    await GroceryCategory.deleteMany();
    console.log("🧹 Cleared old data");

    // Insert Categories
    const insertedCategories = await GroceryCategory.insertMany(categoryData);
    console.log("📁 Inserted categories");

    // Insert Subcategories + Products
    for (const category of insertedCategories) {
      const subNames = subcategoryMap[category.name] || [];

      for (const subName of subNames) {
        const sub = new GrocerySubcategory({
          name: subName,
          image: "",
          categoryId: category._id,
        });

        await sub.save();

        // Generate products for each subcategory
        const products = generateProducts(sub._id, sub.name);
        await GroceryProduct.insertMany(products);
      }
    }

    console.log("📁 Inserted subcategories + products");
    process.exit();
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedData();
