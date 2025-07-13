const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const FilterGroceryCategory = require("../models/FilterGroceryCategory");
const FilterGroceryProduct = require("../models/FilterGroceryProduct");
const FilterPopularVeggies = require("../models/FilterPopularVeggies");
const FilterPopularVeggiesProduct = require("../models/FilterPopularVeggiesProduct");
const DairyCategory = require("../models/DairyCategory");
const DairyProduct = require("../models/DairyProduct");
const GroceryProduct = require("../models/GroceryProduct");
const FruitsVegProduct = require("../models/FruitsVegProduct");
const MilkProduct = require("../models/MilkProduct");
const FilterMedicine = require("../models/FilterMedicine");
const FilterMedicineProduct = require("../models/FilterMedicineProduct");
const MedicineProduct = require("../models/MedicineProduct");
const authAdmin = require("../middleware/authAdmin");

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// FilterGroceryCategory CRUD
router.post("/grocery-categories",authAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({
        message: "Name is required",
        data: null,
        error: true,
      });
    }
    const category = new FilterGroceryCategory({ name, description });
    await category.save();
    res.status(201).json({
      message: "Grocery category created successfully",
      data: category,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
      error: true,
    });
  }
});

router.get("/grocery-categories", async (req, res) => {
  try {
    const categories = await FilterGroceryCategory.find();
    res.status(200).json({
      message: "Grocery categories fetched successfully",
      data: categories,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
      error: true,
    });
  }
});

router.put("/grocery-categories/:id",authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid grocery category ID",
        data: null,
        error: true,
      });
    }
    const { name, description } = req.body;
    const category = await FilterGroceryCategory.findByIdAndUpdate(
      id,
      { name, description, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!category) {
      return res.status(404).json({
        message: "Grocery category not found",
        data: null,
        error: true,
      });
    }
    res.status(200).json({
      message: "Grocery category updated successfully",
      data: category,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
      error: true,
    });
  }
  
});



router.delete("/grocery-categories/:id",authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid grocery category ID",
        data: null,
        error: true,
      });
    }
    const category = await FilterGroceryCategory.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({
        message: "Grocery category not found",
        data: null,
        error: true,
      });
    }
    res.status(200).json({
      message: "Grocery category deleted successfully",
      data: category,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
      error: true,
    });
  }
});

// FilterGroceryProduct CRUD
router.post("/grocery-products",authAdmin, async (req, res) => {
  try {
    const { productIds, categoryId } = req.body;
    if (!Array.isArray(productIds) || productIds.length === 0 || !categoryId) {
      return res.status(400).json({
        message: "productIds (non-empty array) and categoryId are required",
        data: null,
        error: true,
      });
    }
    if (!isValidObjectId(categoryId) || !productIds.every(id => isValidObjectId(id))) {
      return res.status(400).json({
        message: "Invalid product ID(s) or category ID",
        data: null,
        error: true,
      });
    }
    const category = await FilterGroceryCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        message: "Grocery category not found",
        data: null,
        error: true,
      });
    }
    const products = await GroceryProduct.find({ _id: { $in: productIds } });
    if (products.length !== productIds.length) {
      const foundIds = products.map(p => p._id.toString());
      const missingIds = productIds.filter(id => !foundIds.includes(id));
      return res.status(404).json({
        message: `Products not found for IDs: ${missingIds.join(", ")}`,
        data: null,
        error: true,
      });
    }
    const existingMappings = await FilterGroceryProduct.find({
      categoryId,
      productId: { $in: productIds },
    });
    const existingProductIds = existingMappings.map(item => item.productId.toString());
    const newProductIds = productIds.filter(id => !existingProductIds.includes(id));
    if (newProductIds.length === 0) {
      return res.status(200).json({
        message: "All provided products are already mapped to this category",
        data: [],
        error: false,
      });
    }
    const filterProducts = newProductIds.map(productId => ({
      productId,
      categoryId,
    }));
    const saved = await FilterGroceryProduct.insertMany(filterProducts, { ordered: false });
    const responseData = {
      added: saved.map(item => ({
        productId: item.productId,
        categoryId: item.categoryId,
        _id: item._id,
      })),
      skipped: existingProductIds.map(id => ({ productId: id })),
    };
    res.status(201).json({
      message: `Successfully added ${saved.length} new product(s) to category${existingProductIds.length > 0 ? `, ${existingProductIds.length} product(s) already mapped` : ""}`,
      data: responseData,
      error: false,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "One or more product-category mappings already exist",
        data: null,
        error: true,
      });
    }
    res.status(500).json({
      message: `Server error: ${error.message}`,
      data: null,
      error: true,
    });
  }
});

router.get("/grocery-categories/products/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!isValidObjectId(categoryId)) {
      return res.status(400).json({
        message: "Invalid category ID",
        data: null,
        error: true,
      });
    }
    const category = await FilterGroceryCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        message: "Grocery category not found",
        data: null,
        error: true,
      });
    }
    const filterProducts = await FilterGroceryProduct.find({ categoryId }).populate({
      path: "productId",
      select: "name price mrp brand stock image description unit subcategoryId",
    });
    const products = filterProducts.map(fp => fp.productId);
    res.status(200).json({
      message: `Successfully fetched ${products.length} product(s) for category`,
      data: products,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: `Server error: ${error.message}`,
      data: null,
      error: true,
    });
  }
});


router.get("/filter-grocery-categories-with-products", async (req, res) => {
  try {
    const categories = await FilterGroceryCategory.find();

    const result = await Promise.all(
      categories.map(async (cat) => {
        const productsMapped = await FilterGroceryProduct.find({ categoryId: cat._id })
          .populate({
            path: "productId",
            model: "GroceryProduct",
          });

        return {
          _id: cat._id,
          name: cat.name,
          description: cat.description,
          products: productsMapped.map((p) => p.productId), // populated product details
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "Filter grocery categories with products fetched successfully",
      data: result,
      error: false,
    });
  } catch (err) {
    console.error("Error fetching filter grocery categories:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching filter grocery data",
      error: true,
    });
  }
});


// FilterPopularVeggies CRUD
router.post("/popular-veggies",authAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({
        message: "Name is required",
        data: null,
        error: true,
      });
    }
    const category = new FilterPopularVeggies({ name, description });
    await category.save();
    res.status(201).json({
      message: "Popular veggies category created successfully",
      data: category,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
      error: true,
    });
  }
});

router.get("/popular-veggies", async (req, res) => {
  try {
    const categories = await FilterPopularVeggies.find();
    res.status(200).json({
      message: "Popular veggies categories fetched successfully",
      data: categories,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
      error: true,
    });
  }
});

router.put("/popular-veggies/:id",authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid popular veggies category ID",
        data: null,
        error: true,
      });
    }
    const { name, description } = req.body;
    const category = await FilterPopularVeggies.findByIdAndUpdate(
      id,
      { name, description, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!category) {
      return res.status(404).json({
        message: "Popular veggies category not found",
        data: null,
        error: true,
      });
    }
    res.status(200).json({
      message: "Popular veggies category updated successfully",
      data: category,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
      error: true,
    });
  }
});

router.delete("/popular-veggies/:id",authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid popular veggies category ID",
        data: null,
        error: true,
      });
    }
    const category = await FilterPopularVeggies.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({
        message: "Popular veggies category not found",
        data: null,
        error: true,
      });
    }
    res.status(200).json({
      message: "Popular veggies category deleted successfully",
      data: category,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
      error: true,
    });
  }
});

// FilterPopularVeggiesProduct CRUD
router.post("/popular-veggies-products",authAdmin, async (req, res) => {
  try {
    const { productIds, categoryId } = req.body;
    if (!Array.isArray(productIds) || productIds.length === 0 || !categoryId) {
      return res.status(400).json({
        message: "productIds (non-empty array) and categoryId are required",
        data: null,
        error: true,
      });
    }
    if (!isValidObjectId(categoryId) || !productIds.every(id => isValidObjectId(id))) {
      return res.status(400).json({
        message: "Invalid product ID(s) or category ID",
        data: null,
        error: true,
      });
    }
    const category = await FilterPopularVeggies.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        message: "Popular veggies category not found",
        data: null,
        error: true,
      });
    }
    const products = await FruitsVegProduct.find({ _id: { $in: productIds } });
    if (products.length !== productIds.length) {
      const foundIds = products.map(p => p._id.toString());
      const missingIds = productIds.filter(id => !foundIds.includes(id));
      return res.status(404).json({
        message: `Products not found for IDs: ${missingIds.join(", ")}`,
        data: null,
        error: true,
      });
    }
    const existingMappings = await FilterPopularVeggiesProduct.find({
      categoryId,
      productId: { $in: productIds },
    });
    const existingProductIds = existingMappings.map(item => item.productId.toString());
    const newProductIds = productIds.filter(id => !existingProductIds.includes(id));
    if (newProductIds.length === 0) {
      return res.status(200).json({
        message: "All provided products are already mapped to this category",
        data: [],
        error: false,
      });
    }
    const filterProducts = newProductIds.map(productId => ({
      productId,
      categoryId,
    }));
    const saved = await FilterPopularVeggiesProduct.insertMany(filterProducts, { ordered: false });
    const responseData = {
      added: saved.map(item => ({
        productId: item.productId,
        categoryId: item.categoryId,
        _id: item._id,
      })),
      skipped: existingProductIds.map(id => ({ productId: id })),
    };
    res.status(201).json({
      message: `Successfully added ${saved.length} new product(s) to category${existingProductIds.length > 0 ? `, ${existingProductIds.length} product(s) already mapped` : ""}`,
      data: responseData,
      error: false,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "One or more product-category mappings already exist",
        data: null,
        error: true,
      });
    }
    res.status(500).json({
      message: `Server error: ${error.message}`,
      data: null,
      error: true,
    });
  }
});

router.get("/popular-veggies/products/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!isValidObjectId(categoryId)) {
      return res.status(400).json({
        message: "Invalid category ID",
        data: null,
        error: true,
      });
    }
    const category = await FilterPopularVeggies.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        message: "Popular veggies category not found",
        data: null,
        error: true,
      });
    }
    const filterProducts = await FilterPopularVeggiesProduct.find({ categoryId }).populate({
      path: "productId",
      select: "name images price mrp unit quantity isOrganic description origin availability",
    });
    const products = filterProducts.map(fp => fp.productId);
    res.status(200).json({
      message: `Successfully fetched ${products.length} product(s) for category`,
      data: products,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: `Server error: ${error.message}`,
      data: null,
      error: true,
    });
  }
});



router.get("/filter-popular-veggies-with-products", async (req, res) => {
  try {
    const categories = await FilterPopularVeggies.find();

    const result = await Promise.all(
      categories.map(async (cat) => {
        const productsMapped = await FilterPopularVeggiesProduct.find({ categoryId: cat._id })
          .populate({
            path: "productId",
            model: "FruitsVegProduct",
          });

        return {
          _id: cat._id,
          name: cat.name,
          description: cat.description,
          products: productsMapped.map((p) => p.productId), // populated product details
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "Popular veggies categories with products fetched successfully",
      data: result,
      error: false,
    });
  } catch (err) {
    console.error("Error fetching popular veggies:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching popular veggies",
      error: true,
    });
  }
});



// DairyCategory CRUD
router.post("/dairy-categories",authAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({
        message: "Name is required",
        data: null,
        error: true,
      });
    }
    const category = new DairyCategory({ name, description });
    await category.save();
    res.status(201).json({
      message: "Dairy category created successfully",
      data: category,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
      error: true,
    });
  }
});

router.get("/dairy-categories", async (req, res) => {
  try {
    const categories = await DairyCategory.find();
    res.status(200).json({
      message: "Dairy categories fetched successfully",
      data: categories,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
      error: true,
    });
  }
});

router.put("/dairy-categories/:id",authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid dairy category ID",
        data: null,
        error: true,
      });
    }
    const { name, description } = req.body;
    const category = await DairyCategory.findByIdAndUpdate(
      id,
      { name, description, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!category) {
      return res.status(404).json({
        message: "Dairy category not found",
        data: null,
        error: true,
      });
    }
    res.status(200).json({
      message: "Dairy category updated successfully",
      data: category,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
      error: true,
    });
  }
});

router.delete("/dairy-categories/:id",authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid dairy category ID",
        data: null,
        error: true,
      });
    }
    const category = await DairyCategory.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({
        message: "Dairy category not found",
        data: null,
        error: true,
      });
    }
    res.status(200).json({
      message: "Dairy category deleted successfully",
      data: category,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      data: null,
      error: true,
    });
  }
});

// DairyProduct CRUD
router.post("/dairy-products",authAdmin, async (req, res) => {
  try {
    const { productIds, categoryId } = req.body;
    if (!Array.isArray(productIds) || productIds.length === 0 || !categoryId) {
      return res.status(400).json({
        message: "productIds (non-empty array) and categoryId are required",
        data: null,
        error: true,
      });
    }
    if (!isValidObjectId(categoryId) || !productIds.every(id => isValidObjectId(id))) {
      return res.status(400).json({
        message: "Invalid product ID(s) or category ID",
        data: null,
        error: true,
      });
    }
    const category = await DairyCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        message: "Dairy category not found",
        data: null,
        error: true,
      });
    }
    const products = await MilkProduct.find({ _id: { $in: productIds } });
    if (products.length !== productIds.length) {
      const foundIds = products.map(p => p._id.toString());
      const missingIds = productIds.filter(id => !foundIds.includes(id));
      return res.status(404).json({
        message: `Products not found for IDs: ${missingIds.join(", ")}`,
        data: null,
        error: true,
      });
    }
    const existingMappings = await DairyProduct.find({
      categoryId,
      productId: { $in: productIds },
    });
    const existingProductIds = existingMappings.map(item => item.productId.toString());
    const newProductIds = productIds.filter(id => !existingProductIds.includes(id));
    if (newProductIds.length === 0) {
      return res.status(200).json({
        message: "All provided products are already mapped to this category",
        data: [],
        error: false,
      });
    }
    const filterProducts = newProductIds.map(productId => ({
      productId,
      categoryId,
    }));
    const saved = await DairyProduct.insertMany(filterProducts, { ordered: false });
    const responseData = {
      added: saved.map(item => ({
        productId: item.productId,
        categoryId: item.categoryId,
        _id: item._id,
      })),
      skipped: existingProductIds.map(id => ({ productId: id })),
    };
    res.status(201).json({
      message: `Successfully added ${saved.length} new product(s) to category${existingProductIds.length > 0 ? `, ${existingProductIds.length} product(s) already mapped` : ""}`,
      data: responseData,
      error: false,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "One or more product-category mappings already exist",
        data: null,
        error: true,
      });
    }
    res.status(500).json({
      message: `Server error: ${error.message}`,
      data: null,
      error: true,
    });
  }
});

router.get("/dairy-categories/products/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!isValidObjectId(categoryId)) {
      return res.status(400).json({
        message: "Invalid category ID",
        data: null,
        error: true,
      });
    }
    const category = await DairyCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        message: "Dairy category not found",
        data: null,
        error: true,
      });
    }
    const filterProducts = await DairyProduct.find({ categoryId }).populate({
      path: "productId",
      select: "name image quantity unit price mrp deliveryTime categoryId",
    });
    const products = filterProducts.map(fp => fp.productId);
    res.status(200).json({
      message: `Successfully fetched ${products.length} product(s) for category`,
      data: products,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: `Server error: ${error.message}`,
      data: null,
      error: true,
    });
  }
});




router.get("/dairy-categories-product", async (req, res) => {
  try {
    const categories = await DairyCategory.find();

    const result = await Promise.all(
      categories.map(async (category) => {
        const productMappings = await DairyProduct.find({ categoryId: category._id }).populate("productId");

        const products = productMappings.map((mapping) => mapping.productId);

        return {
          _id: category._id,
          name: category.name,
          description: category.description,
          products,
        };
      })
    );

    res.status(200).json({
      message: "Dairy categories with products fetched successfully",
      data: result,
      error: false,
    });
  } catch (error) {
    console.error("❌ Error fetching dairy categories:", error.message);
    res.status(500).json({
      message: "Failed to fetch dairy categories",
      data: null,
      error: true,
    });
  }
});


router.get("/filter-popular-veggies", async (req, res) => {
  try {
    const categories = await FilterPopularVeggies.find();

    const result = await Promise.all(
      categories.map(async (category) => {
        // Find all product mappings for this category
        const mappings = await FilterPopularVeggiesProduct.find({ categoryId: category._id }).populate("productId");

        // Extract product details from populated mappings
        const products = mappings.map((mapping) => mapping.productId);

        return {
          _id: category._id,
          name: category.name,
          description: category.description,
          products,
        };
      })
    );

    res.status(200).json({
      message: "Filter Popular Veggies with products fetched successfully",
      data: result,
      error: false,
    });
  } catch (error) {
    console.error("❌ Error fetching filter popular veggies:", error.message);
    res.status(500).json({
      message: "Something went wrong while fetching filter popular veggies",
      data: null,
      error: true,
    });
  }
});

router.post("/filter-medicine/category", async (req, res) => {
  try {
    const { name, description } = req.body;
    const exists = await FilterMedicine.findOne({ name });
    if (exists) return res.status(409).json({ success: false, message: "Category already exists" });

    const newCategory = await FilterMedicine.create({ name, description });
    res.status(201).json({ success: true, message: "Category created", data: newCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get All Categories with Products
router.get("/filter-medicine/all", async (req, res) => {
  try {
    const categories = await FilterMedicine.find();
    const result = [];

    for (const cat of categories) {
      const productsMap = await FilterMedicineProduct.find({ categoryId: cat._id }).populate("productId");
      result.push({
        _id: cat._id,
        name: cat.name,
        description: cat.description,
        products: productsMap.map((p) => p.productId),
      });
    }

    res.status(200).json({ success: true, message: "Categories with products fetched", data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add Product to Category
router.post("/filter-medicine/add-product", async (req, res) => {
  try {
    const { productId, categoryId } = req.body;
    if (!productId || !categoryId) {
      return res.status(400).json({ success: false, message: "ProductId and CategoryId are required" });
    }

    const exists = await FilterMedicineProduct.findOne({ productId, categoryId });
    if (exists) return res.status(409).json({ success: false, message: "Mapping already exists" });

    const mapping = await FilterMedicineProduct.create({ productId, categoryId });
    res.status(201).json({ success: true, message: "Product mapped successfully", data: mapping });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete Product Mapping
router.delete("/filter-medicine/delete-product", async (req, res) => {
  try {
    const { productId, categoryId } = req.body;
    await FilterMedicineProduct.deleteOne({ productId, categoryId });
    res.status(200).json({ success: true, message: "Product mapping deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete Category
router.delete("/filter-medicine/category/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await FilterMedicine.findByIdAndDelete(id);
    await FilterMedicineProduct.deleteMany({ categoryId: id });
    res.status(200).json({ success: true, message: "Category and related mappings deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});



router.get("/filter-medicine-categories-products", async (req, res) => {
  try {
    const categories = await FilterMedicine.find();

    const data = await Promise.all(
      categories.map(async (category) => {
        const mappings = await FilterMedicineProduct.find({
          categoryId: category._id,
        }).populate("productId");

        const products = mappings
          .map((m) => m.productId)
          .filter((p) => p != null)
          .map((p) => ({
            _id: p._id,
            name: p.name,
            brand: p.brand,
            price: p.price,
            mrp: p.mrp,
            discount: p.discount,
            stock: p.stock,
            image: p.image,
            description: p.description,
            unit: p.unit,
            expiryDate: p.expiryDate,
            subcategoryId: p.subcategoryId,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
            __v: p.__v,
          }));

        return {
          _id: category._id,
          name: category.name,
          description: category.description,
          products,
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "Filter medicine categories with products fetched successfully",
      data,
      error: false,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch filter medicine categories and products",
      error: true,
      details: err.message,
    });
  }
});



module.exports = router;