// seeds/seedAll.js
const mongoose = require("mongoose");
const MilkCategory = require("./models/MilkCategory");
const milkProduct = require("./models/milkProduct");

const categories = [
  "Amul Dairy",
  "Paras Dairy",
  "Mother Dairy",
  "Nandini Milk",
  "Aavin Milk",
  "Saras Dairy",
  "Vita Milk",
  "Heritage Foods",
];

const productTemplates = [
  { name: "Full Cream Milk", quantity: 1, unit: "Litre", price: 60 },
  { name: "Toned Milk", quantity: 1, unit: "Litre", price: 54 },
  { name: "Double Toned Milk", quantity: 500, unit: "ml", price: 28 },
  { name: "Slim Milk", quantity: 500, unit: "ml", price: 30 },
  { name: "Cow Milk", quantity: 1, unit: "Litre", price: 50 },
  { name: "Buffalo Milk", quantity: 1, unit: "Litre", price: 65 },
  { name: "Organic Milk", quantity: 1, unit: "Litre", price: 70 },
  { name: "Gold Milk", quantity: 1, unit: "Litre", price: 58 },
];

const getRandomBool = () => Math.random() < 0.7;
const getRandomFrequency = () => {
  const options = ["Daily", "Alternate Days", "Weekly", "Monthly", "None"];
  return options[Math.floor(Math.random() * options.length)];
};

async function seed() {
  await mongoose.connect("mongodb://localhost:27017/ecommerce");

  await MilkCategory.deleteMany();
  await milkProduct.deleteMany();

  const insertedCategories = [];

  for (let i = 0; i < categories.length; i++) {
    const cat = await MilkCategory.create({
      name: categories[i],
      address: "Bhopal",
      logo: `uploads/logo-${i + 1}.png`, // Placeholder image name
      rating: 4.0,
    });

    insertedCategories.push(cat);
  }

  const allProducts = [];

  for (let category of insertedCategories) {
    productTemplates.forEach((template, idx) => {
      allProducts.push({
        name: `${category.name} - ${template.name}`,
        image: `uploads/${category.name.toLowerCase().replace(/ /g, "-")}-${
          idx + 1
        }.png`,
        quantity: template.quantity,
        unit: template.unit,
        price: template.price,
        deliveryTime: "11 MINS",
        isSubscription: getRandomBool(),
        subscriptionFrequency: getRandomFrequency(),
        categoryId: category._id,
      });
    });
  }

  await milkProduct.insertMany(allProducts);
  console.log("✅ Seeded 8 categories and 64 milk products.");
  process.exit();
}

seed().catch((err) => {
  console.error("❌ Seeding failed", err);
  process.exit(1);
});
