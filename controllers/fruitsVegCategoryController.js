// const Category = require("../models/FruitsVegCategory");
const Subcategory = require("../models/FruitsVegSubcategory");

const FruitsVegCategory = require("../models/FruitsVegCategory");

exports.createCategory = async (req, res) => {
  try {
    const { name, slug } = req.body;

    const image = req.file ? `/uploads/${req.file.filename}` : undefined;

    const category = await FruitsVegCategory.create({ name, slug, image });

    res.status(201).json({ message: "Category created", data: category });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Category already exists with the same slug",
        field: Object.keys(err.keyValue)[0],
        value: err.keyValue.slug,
      });
    }

    res.status(500).json({ message: "Error creating category", error: err.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await FruitsVegCategory.find();
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: "Error fetching categories", error: err.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await FruitsVegCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ message: "Error fetching category", error: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    let updateData = req.body;
    if (req.file) {
      // Only the relative path to serve via static route
      updateData.image = "" + req.file.filename;
    }
    const category = await FruitsVegCategory.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    res.status(200).json({ message: "Updated successfully", data: category });
  } catch (err) {
    res.status(500).json({ message: "Error updating category", error: err.message });
  }
};


exports.deleteCategory = async (req, res) => {
  try {
    await FruitsVegCategory.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting category", error: err.message });
  }
};


exports.getCategoriesWithSubcategories = async (req, res) => {
  try {
    const categories = await FruitsVegCategory.find().lean();

    const result = await Promise.all(
      categories.map(async (category) => {
        const subcategories = await Subcategory.find({
          categoryId: category._id,
        });

        return {
          ...category,
          subcategories,
        };
      })
    );

    res.status(200).json(result);
  } catch (err) {
    console.error(
      "❌ Failed to fetch Fruits & Veg categories with subcategories",
      err
    );
    res.status(500).json({ message: "Server error" });
  }
};
