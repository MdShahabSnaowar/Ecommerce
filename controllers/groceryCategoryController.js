const GroceryCategory = require("../models/GroceryCategory");
const GrocerySubCategory = require("../models/GrocerySubCategory");


exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const existingCategory = await GroceryCategory.findOne({ name });
    if (existingCategory) {
      return res.status(409).json({
        message: "Category already exists",
        field: "name",
        value: name,
      });
    }

    const image = req.file ? `${req.file.filename}` : undefined;

    const newCategory = await GroceryCategory.create({ name, image });

    res.status(201).json({
      message: "Category created successfully",
      data: newCategory,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error creating category",
      error: err.message,
    });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await GroceryCategory.find();
    res.status(200).json({ message: "Categories fetched", data: categories });
  } catch (err) {
    res.status(500).json({ message: "Error fetching categories", error: err.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await GroceryCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.status(200).json({ message: "Category fetched", data: category });
  } catch (err) {
    res.status(500).json({ message: "Error fetching category", error: err.message });
  }
};

// exports.updateCategory = async (req, res) => {
//   try {
//     const category = await GroceryCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     res.status(200).json({ message: "Category updated", data: category });
//   } catch (err) {
//     res.status(500).json({ message: "Error updating category", error: err.message });
//   }
// };

exports.deleteCategory = async (req, res) => {
  try {
    await GroceryCategory.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting category", error: err.message });
  }
};


exports.getCategoriesWithSubcategories = async (req, res) => {
  try {
    const categories = await GroceryCategory.find();

    const result = await Promise.all(
      categories.map(async (category) => {
        const subcategories = await GrocerySubCategory.find({
          categoryId: category._id,
        });
        return {
          ...category.toObject(),
          subcategories,
        };
      })
    );

    res.json(result);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
