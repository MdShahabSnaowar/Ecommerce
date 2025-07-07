const express = require("express");
const router = express.Router();

const category = require("../controllers/fruitsVegCategoryController");
const subcategory = require("../controllers/fruitsVegSubcategoryController");
const product = require("../controllers/fruitsVegProductController");
const upload = require("../config/multer");
const FruitsVegCategory = require("../models/FruitsVegCategory");
const FruitsVegSubcategory = require("../models/FruitsVegSubcategory");
const FruitsVegProduct = require("../models/FruitsVegProduct");
const MilkCategory = require("../models/MilkCategory");
const MilkProduct = require("../models/MilkProduct");
const GroceryCategory = require("../models/GroceryCategory");
const GrocerySubcategory = require("../models/GrocerySubCategory");
const GroceryProduct = require("../models/GroceryProduct");
const authAdmin = require("../middleware/authAdmin");
const fs = require("fs");
const path = require("path");

// 🥦 Category
router.post("/categories", authAdmin, category.createCategory);
router.get("/categories", category.getAllCategories);
router.get(
  "/categories/with-subcategories",
  authAdmin,
  category.getCategoriesWithSubcategories
);

router.get("/categories/:id", category.getCategoryById);
router.put("/categories/:id", authAdmin, category.updateCategory);
router.delete("/categories/:id", authAdmin, category.deleteCategory);

// 🥕 Subcategory
router.post(
  "/subcategories",
  authAdmin,
  upload.single("image"),
  subcategory.createSubcategory
);
router.get("/subcategories", subcategory.getAllSubcategories);
router.get("/subcategories/:id", subcategory.getSubcategoryById);
router.put(
  "/subcategories/:id",
  authAdmin,
  upload.single("image"),
  subcategory.updateSubcategory
);
router.delete("/subcategories/:id", authAdmin, subcategory.deleteSubcategory);

// 🍎 Products
router.post(
  "/product",
  authAdmin,
  upload.array("images", 5),
  product.createProduct
);
router.get("/product", product.getAllProducts);
router.get(
  "/product/subcategory/:subcategoryId",
  product.getAllProductBySubcategoryId
);
router.get("/product/:id", product.getProductById);

router.put("/product/:id",authAdmin, upload.array("images", 5), product.updateProduct);
router.delete("/product/:id", authAdmin,product.deleteProduct);




router.post("/import-fruits-veg", upload.single("file"), async (req, res) => {
  try {
    const { type } = req.body;

    if (!req.file || !type) {
      return res.status(400).json({ error: "File and type are required" });
    }

    const filePath = req.file.path;
    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    if (type === "Fruits&Vegetables") {
      // ✅ Fruits & Vegetables logic
      const categoryData = jsonData.FruitsVegCategory[0];
      let createdCategory = await FruitsVegCategory.findOne({ slug: categoryData.slug });
      if (!createdCategory) {
        createdCategory = await FruitsVegCategory.create(categoryData);
      }

      const subcategoryIdMap = {};
      for (const subcat of jsonData.FruitsVegSubcategory) {
        const newSubcat = await FruitsVegSubcategory.create({
          name: subcat.name,
          image: subcat.image,
          categoryId: createdCategory._id,
        });
        subcategoryIdMap[subcat.id] = newSubcat._id;
      }

      const productPromises = jsonData.FruitsVegProduct.map((prod) => {
        const subId = subcategoryIdMap[prod.sub_id];
        if (!subId) return null;

        return FruitsVegProduct.create({
          name: prod.name,
          images: prod.images,
          subcategoryId: subId,
          price: prod.price,
          mrp: prod.mrp,
          unit: prod.unit,
          quantity: prod.quantity,
          isOrganic: prod.isOrganic,
          description: prod.description,
          origin: prod.origin,
          availability: prod.availability,
        });
      });

      await Promise.all(productPromises.filter(Boolean));
      return res.status(200).json({ message: "Fruits & Vegetables data imported successfully" });

    } else if (type === "Milk") {
      // ✅ Milk logic
      const categoryIdMap = {};

      for (const cat of jsonData.categories) {
        const newCat = await MilkCategory.create({
          name: cat.name,
          image: cat.image,
          rating: cat.rating,
          address: cat.address,
        });
        categoryIdMap[cat.id] = newCat._id;
      }

      const productPromises = jsonData.products.map((prod) => {
        const catId = categoryIdMap[prod.categoryId];
        if (!catId) return null;

        return MilkProduct.create({
          name: prod.name,
          image: prod.image,
          quantity: prod.quantity,
          unit: prod.unit,
          price: prod.price,
          mrp: prod.mrp,
          deliveryTime: prod.deliveryTime,
          categoryId: catId,
        });
      });

      await Promise.all(productPromises.filter(Boolean));
      return res.status(200).json({ message: "Milk data imported successfully" });

    } else if (type === "Grocery") {
  // ✅ Grocery logic
  const groceryCategoryIdMap = {};

  for (const cat of jsonData.groceryCategories) {
    let existingCategory = await GroceryCategory.findOne({ name: cat.name });

    if (!existingCategory) {
      existingCategory = await GroceryCategory.create({
        name: cat.name,
      });
    }

    groceryCategoryIdMap[cat.id] = existingCategory._id;
  }

  const grocerySubcategoryIdMap = {};

  for (const sub of jsonData.grocerySubcategories) {
    const categoryId = groceryCategoryIdMap[sub.categoryId];
    if (!categoryId) continue;

    const newSub = await GrocerySubcategory.create({
      name: sub.name,
      image: sub.image,
      categoryId: categoryId,
    });

    grocerySubcategoryIdMap[sub.id] = newSub._id;
  }

  const productPromises = jsonData.groceryProducts.map((prod) => {
    const subId = grocerySubcategoryIdMap[prod.subcategoryId];
    if (!subId) return null;

    return GroceryProduct.create({
      name: prod.name,
      price: prod.price,
      mrp: prod.mrp,
      brand: prod.brand,
      stock: prod.stock,
      image: prod.image,
      description: prod.description,
      unit: prod.unit,
      subcategoryId: subId,
    });
  });

  await Promise.all(productPromises.filter(Boolean));
  return res.status(200).json({ message: "Grocery data imported successfully" });

    } else {
      return res.status(400).json({ error: "Invalid type value. Use 'Fruits&Vegetables', 'Milk', or 'Grocery'" });
    }

  } catch (err) {
    console.error(err);

    // ✅ Friendly duplicate key error handler
    if (err.code === 11000 && err.keyValue) {
      const field = Object.keys(err.keyValue)[0];
      const value = err.keyValue[field];
      return res.status(409).json({
        error: `Duplicate entry: A record with ${field} "${value}" already exists in the database.`,
      });
    }

    return res.status(500).json({ error: "Something went wrong while importing data. Please try again." });
  }
});



router.put(
  "/product/:id",
  authAdmin,
  upload.array("images", 5),
  product.updateProduct
);
router.delete("/product/:id", authAdmin, product.deleteProduct);

module.exports = router;



