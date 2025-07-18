const FruitsVegSubcategory = require("../models/FruitsVegSubcategory");

exports.createSubcategory = async (req, res) => {
  try {
    const { name, categoryId } = req.body;

    // Only use filename to build relative path
    const image = req.file ? `uploads/${req.file.filename}` : undefined;

    const subcategory = await FruitsVegSubcategory.create({
      name,
      image,
      categoryId,
    });

    res.status(201).json({
      message: "Subcategory created successfully",
      data: subcategory,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error creating subcategory",
      error: err.message,
    });
  }
};

exports.getAllSubcategories = async (req, res) => {
  try {
    const subcategories = await FruitsVegSubcategory.find().populate("categoryId");
    res.status(200).json({
      message: "Subcategories fetched successfully",
      data: subcategories,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching subcategories",
      error: err.message,
    });
  }
};

exports.getSubcategoryById = async (req, res) => {
  try {
    const subcategory = await FruitsVegSubcategory.findById(req.params.id).populate("categoryId");

    if (!subcategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    res.status(200).json({
      message: "Subcategory fetched successfully",
      data: subcategory,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching subcategory",
      error: err.message,
    });
  }
};


exports.updateSubcategory = async (req, res) => {
  try {
    const updatedData = {
      name: req.body.name,
      categoryId: req.body.categoryId,
    };
    if (req.file?.path) updatedData.image = req.file.path;

    const subcategory = await FruitsVegSubcategory.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.status(200).json({ message: "Subcategory updated", data: subcategory });
  } catch (err) {
    res.status(500).json({ message: "Error updating subcategory", error: err.message });
  }
};

exports.deleteSubcategory = async (req, res) => {
  try {
    await FruitsVegSubcategory.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Subcategory deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting subcategory", error: err.message });
  }
};


exports.getSubcategoriesByCategoryId = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const subcategories = await FruitsVegSubcategory.find({
      categoryId,
    }).populate("categoryId");

    res.status(200).json({
      message: "Subcategories fetched successfully",
      data: subcategories,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching subcategories by categoryId",
      error: err.message,
    });
  }
};