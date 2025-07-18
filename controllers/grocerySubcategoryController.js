
const GrocerySubcategory = require("../models/GrocerySubCategory");

exports.createSubcategory = async (req, res) => {
  try {
    const { name, categoryId } = req.body;
    const image = req.file ? `${req.file.filename}` : undefined;

    const subcategory = await GrocerySubcategory.create({ name, image, categoryId });
    res.status(201).json({ message: "Subcategory created", data: subcategory });
  } catch (err) {
    res.status(500).json({ message: "Error creating subcategory", error: err.message });
  }
};

exports.getAllSubcategories = async (req, res) => {
  try {
    const subcategories = await GrocerySubcategory.find().populate("categoryId");
    res.status(200).json({ message: "Subcategories fetched", data: subcategories });
  } catch (err) {
    res.status(500).json({ message: "Error fetching subcategories", error: err.message });
  }
};

exports.getSubcategoryById = async (req, res) => {
  try {
    const subcategory = await GrocerySubcategory.findById(req.params.id).populate("categoryId");
    if (!subcategory) return res.status(404).json({ message: "Subcategory not found" });
    res.status(200).json({ message: "Subcategory fetched", data: subcategory });
  } catch (err) {
    res.status(500).json({ message: "Error fetching subcategory", error: err.message });
  }
};

exports.updateSubcategory = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.image = `${req.file.filename}`;

    const subcategory = await GrocerySubcategory.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.status(200).json({ message: "Subcategory updated", data: subcategory });
  } catch (err) {
    res.status(500).json({ message: "Error updating subcategory", error: err.message });
  }
};

exports.deleteSubcategory = async (req, res) => {
  try {
    await GrocerySubcategory.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Subcategory deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting subcategory", error: err.message });
  }
};



exports.getSubcategoriesByCategoryId = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const subcategories = await GrocerySubcategory.find({
      categoryId,
    }).populate("categoryId");

    res.status(200).json({
      message: "Grocery Subcategories fetched successfully",
      data: subcategories,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching subcategories by categoryId",
      error: err.message,
    });
  }
};