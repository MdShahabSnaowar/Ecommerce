const express = require("express");
const router = express.Router();

const category = require("../controllers/fruitsVegCategoryController");
const subcategory = require("../controllers/fruitsVegSubcategoryController");
const product = require("../controllers/fruitsVegProductController");
const upload = require("../config/multer");
const FruitsVegCategory = require("../models/FruitsVegCategory");
const FruitsVegSubcategory = require("../models/FruitsVegSubcategory");
const FruitsVegProduct = require("../models/FruitsVegProduct");
const MedicineCategory = require("../models/MedicineCategory");
const MedicineSubcategory = require("../models/MedicineSubcategory");
const MedicineProduct = require("../models/MedicineProduct");
const MilkCategory = require("../models/MilkCategory");
const MilkProduct = require("../models/MilkProduct");
const GroceryCategory = require("../models/GroceryCategory");
const GrocerySubcategory = require("../models/GrocerySubCategory");
const GroceryProduct = require("../models/GroceryProduct");
const authAdmin = require("../middleware/authAdmin");
const fs = require("fs");
const path = require("path");

// 🥦 Category
// router.post("/categories", authAdmin, category.createCategory);

router.post("/categories", authAdmin, upload.single("image"), category.createCategory);

router.get("/categories", category.getAllCategories);
router.get(
  "/categories/with-subcategories",
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

// router.put("/product/:id",authAdmin, upload.array("images", 5), product.updateProduct);
// router.delete("/product/:id", authAdmin,product.deleteProduct);


router.post("/import-fruits-veg", upload.single("file"), async (req, res) => {
  try {
    const { type } = req.body;
    // console.log("🔍 File:", req.file);
    // console.log("🔍 Body Type:", req.body.type);

    if (!req.file || !type) {
      return res.status(400).json({ success: false, message: "File and type are required" });
    }

    const filePath = req.file.path;
    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    if (type === "Fruits&Vegetables") {
      const categoryData = jsonData.FruitsVegCategory[0];
      let createdCategory = await FruitsVegCategory.findOne({ slug: categoryData.slug });
      if (!createdCategory) {
        createdCategory = await FruitsVegCategory.create(categoryData);
      }

      const subcategoryIdMap = {};
      const skippedSubcategories = [];

      for (const subcat of jsonData.FruitsVegSubcategory) {
        try {
          let existing = await FruitsVegSubcategory.findOne({
            name: subcat.name,
            categoryId: createdCategory._id,
          });

          if (existing) {
            subcategoryIdMap[subcat.id] = existing._id;
            skippedSubcategories.push(`"${subcat.name}"`);
            continue;
          }

          const newSubcat = await FruitsVegSubcategory.create({
            name: subcat.name,
            image: subcat.image,
            categoryId: createdCategory._id,
          });
          subcategoryIdMap[subcat.id] = newSubcat._id;
        } catch (err) {
          skippedSubcategories.push(`"${subcat.name}" (error: ${err.message})`);
        }
      }

      const insertedProducts = [];
      const skippedProducts = [];

      for (const prod of jsonData.FruitsVegProduct) {
        const subId = subcategoryIdMap[prod.sub_id];
        if (!subId) {
          skippedProducts.push(`"${prod.name}" (subcategory not found)`);
          continue;
        }

        try {
          const existing = await FruitsVegProduct.findOne({
            name: prod.name,
            subcategoryId: subId,
          });

          if (existing) {
            skippedProducts.push(`"${prod.name}" (duplicate)`);
            continue;
          }

          const newProd = await FruitsVegProduct.create({
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

          insertedProducts.push(newProd.name);
        } catch (err) {
          skippedProducts.push(`"${prod.name}" (error: ${err.message})`);
        }
      }

      return res.status(200).json({
        success: true,
        message: "Fruits & Vegetables data imported",
        data: {
          insertedProductsCount: insertedProducts.length,
          skippedProductsCount: skippedProducts.length,
          skippedProducts,
          skippedSubcategories,
        },
      });
    }

    // 🥛 MILK SECTION
    else if (type === "Milk") {
      const categoryIdMap = {};
      const skippedCategories = [];
      const skippedProducts = [];
      const insertedProducts = [];

      for (const cat of jsonData.categories) {
        try {
          let existing = await MilkCategory.findOne({ name: cat.name });
          if (existing) {
            categoryIdMap[cat.id] = existing._id;
            skippedCategories.push(`"${cat.name}" (duplicate)`);
            continue;
          }

          const newCat = await MilkCategory.create(cat);
          categoryIdMap[cat.id] = newCat._id;
        } catch (err) {
          skippedCategories.push(`"${cat.name}" (error: ${err.message})`);
        }
      }

      for (const prod of jsonData.products) {
        const catId = categoryIdMap[prod.categoryId];
        if (!catId) {
          skippedProducts.push(`"${prod.name}" (category missing)`);
          continue;
        }

        try {
          const existing = await MilkProduct.findOne({
            name: prod.name,
            categoryId: catId,
          });

          if (existing) {
            skippedProducts.push(`"${prod.name}" (duplicate)`);
            continue;
          }

          const newProd = await MilkProduct.create({
            ...prod,
            categoryId: catId,
          });

          insertedProducts.push(newProd.name);
        } catch (err) {
          skippedProducts.push(`"${prod.name}" (error: ${err.message})`);
        }
      }

      return res.status(200).json({
        success: true,
        message: "Milk data imported",
        data: {
          insertedProductsCount: insertedProducts.length,
          skippedProductsCount: skippedProducts.length,
          skippedProducts,
          skippedCategories,
        },
      });
    }

    // 🛒 GROCERY SECTION (Updated with duplicate checks)
    else if (type === "Grocery") {
      const groceryCategoryIdMap = {};
      const grocerySubcategoryIdMap = {};
      const skippedCategories = [];
      const skippedSubcategories = [];
      const insertedProducts = [];
      const skippedProducts = [];

      // Categories
      for (const cat of jsonData.groceryCategories) {
        try {
          let existing = await GroceryCategory.findOne({ name: cat.name });
          if (existing) {
            groceryCategoryIdMap[cat.id] = existing._id;
            skippedCategories.push(`"${cat.name}" (duplicate)`);
            continue;
          }

          const newCategory = await GroceryCategory.create({ name: cat.name });
          groceryCategoryIdMap[cat.id] = newCategory._id;
        } catch (err) {
          skippedCategories.push(`"${cat.name}" (error: ${err.message})`);
        }
      }

      // Subcategories
      for (const sub of jsonData.grocerySubcategories) {
        const categoryId = groceryCategoryIdMap[sub.categoryId];
        if (!categoryId) {
          skippedSubcategories.push(`"${sub.name}" (categoryId missing)`);
          continue;
        }

        try {
          let existingSub = await GrocerySubcategory.findOne({
            name: sub.name,
            categoryId: categoryId,
          });

          if (existingSub) {
            grocerySubcategoryIdMap[sub.id] = existingSub._id;
            skippedSubcategories.push(`"${sub.name}" (duplicate)`);
            continue;
          }

          const newSub = await GrocerySubcategory.create({
            name: sub.name,
            image: sub.image,
            categoryId: categoryId,
          });

          grocerySubcategoryIdMap[sub.id] = newSub._id;
        } catch (err) {
          skippedSubcategories.push(`"${sub.name}" (error: ${err.message})`);
        }
      }

      // Products
      for (const prod of jsonData.groceryProducts) {
        const subId = grocerySubcategoryIdMap[prod.subcategoryId];
        if (!subId) {
          skippedProducts.push(`"${prod.name}" (subcategoryId "${prod.subcategoryId}" not found)`);
          continue;
        }

        try {
          const existing = await GroceryProduct.findOne({
            name: prod.name,
            subcategoryId: subId,
          });

          if (existing) {
            skippedProducts.push(`"${prod.name}" (duplicate)`);
            continue;
          }

          const newProduct = await GroceryProduct.create({
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

          insertedProducts.push(newProduct.name);
        } catch (error) {
          skippedProducts.push(`"${prod.name}" (error: ${error.message})`);
        }
      }

      return res.status(200).json({
        success: true,
        message: "Grocery data imported successfully",
        data: {
          insertedCount: insertedProducts.length,
          skippedCount: skippedProducts.length,
          skippedProducts,
          skippedCategories,
          skippedSubcategories,
        },
      });
    }

    else if (type === "Medicine") {
      const medicineCategoryIdMap = {};
      const medicineSubcategoryIdMap = {};
      const insertedProducts = [];
      const skippedCategories = [];
      const skippedSubcategories = [];
      const skippedProducts = [];

      for (const cat of jsonData.medicineCategories) {
        try {
          let existing = await MedicineCategory.findOne({ name: cat.name });
          if (existing) {
            medicineCategoryIdMap[cat.id] = existing._id;
            skippedCategories.push(`"${cat.name}" (duplicate)`);
            continue;
          }

          const newCat = await MedicineCategory.create({
            name: cat.name,
            description: cat.description,
          });

          medicineCategoryIdMap[cat.id] = newCat._id;
        } catch (err) {
          skippedCategories.push(`"${cat.name}" (error: ${err.message})`);
        }
      }

      for (const sub of jsonData.medicineSubcategories) {
        const categoryId = medicineCategoryIdMap[sub.categoryId];
        if (!categoryId) {
          skippedSubcategories.push(`"${sub.name}" (categoryId missing)`);
          continue;
        }

        try {
          let existing = await MedicineSubcategory.findOne({
            name: sub.name,
            categoryId,
          });

          if (existing) {
            medicineSubcategoryIdMap[sub.id] = existing._id;
            skippedSubcategories.push(`"${sub.name}" (duplicate)`);
            continue;
          }

          const newSub = await MedicineSubcategory.create({
            name: sub.name,
            description: sub.description,
            categoryId,
          });

          medicineSubcategoryIdMap[sub.id] = newSub._id;
        } catch (err) {
          skippedSubcategories.push(`"${sub.name}" (error: ${err.message})`);
        }
      }

      for (const prod of jsonData.medicineProducts) {
        const catId = medicineCategoryIdMap[prod.categoryId];
        const subcatId = medicineSubcategoryIdMap[prod.subcategoryId];

        if (!catId || !subcatId) {
          skippedProducts.push(`"${prod.name}" (missing category/subcategory)`);
          continue;
        }

        try {
          const existing = await MedicineProduct.findOne({
            name: prod.name,
            categoryId: catId,
            subcategoryId: subcatId,
          });

          if (existing) {
            skippedProducts.push(`"${prod.name}" (duplicate)`);
            continue;
          }

          const newProd = await MedicineProduct.create({
            name: prod.name,
            brand: prod.brand,
            categoryId: catId,
            subcategoryId: subcatId,
            price: prod.price,
            mrp: prod.mrp,
            discount: prod.discount,
            stock: prod.stock,
            description: prod.description,
            expiryDate: prod.expiryDate,
            image: prod.image,
          });

          insertedProducts.push(newProd.name);
        } catch (err) {
          skippedProducts.push(`"${prod.name}" (error: ${err.message})`);
        }
      }

      return res.status(200).json({
        success: true,
        message: "Medicine data imported",
        data: {
          insertedProductsCount: insertedProducts.length,
          skippedProductsCount: skippedProducts.length,
          skippedProducts,
          skippedSubcategories,
          skippedCategories,
        },
      });
    }
    



    return res.status(400).json({
      success: false,
      message: "Invalid type value. Use 'Fruits&Vegetables', 'Milk', or 'Grocery'",
    });
  } catch (err) {
    console.error(err);

    if (err.code === 11000 && err.keyValue) {
      const field = Object.keys(err.keyValue)[0];
      const value = err.keyValue[field];
      return res.status(409).json({
        success: false,
        message: `Duplicate entry: ${field} "${value}" already exists.`,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong while importing data. Please try again.",
    });
  }
  
});





router.put("/product/:id",upload.array("images", 5),product.updateProduct);
router.delete("/product/:id", authAdmin, product.deleteProduct);

module.exports = router;



