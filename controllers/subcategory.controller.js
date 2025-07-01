// @desc    Create new sub-category

const SubCategory = require("../models/SubCategory");

// @route   POST /api/sub-categories
exports.createSubCategory = async (req, res) => {
  try {
    const { name, category, description } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!name || !category) {
      return res
        .status(400)
        .json({ message: "Name and category are required." });
    }
    const subCategory = new SubCategory({ name, image, category, description });
    await subCategory.save();

    res.status(201).json(subCategory);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// @desc    Get all sub-categories
// @route   GET /api/sub-categories
exports.getAllSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.find().populate("category");
    res.status(200).json(subCategories);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// @desc    Get sub-category by ID
// @route   GET /api/sub-categories/:id
exports.getSubCategoryById = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id).populate(
      "category"
    );

    if (!subCategory) {
      return res.status(404).json({ message: "Sub-category not found." });
    }

    res.status(200).json(subCategory);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// @desc    Update sub-category
// @route   PUT /api/sub-categories/:id
exports.updateSubCategory = async (req, res) => {
  try {
    const { name, category } = req.body;
    const image = req.file ? req.file.filename : undefined;

    const updateData = {
      name,
      category,
    };

    if (image !== undefined) updateData.image = image;

    const subCategory = await SubCategory.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!subCategory) {
      return res.status(404).json({ message: "Sub-category not found." });
    }

    res.status(200).json(subCategory);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// @desc    Delete sub-category
// @route   DELETE /api/sub-categories/:id
exports.deleteSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findByIdAndDelete(req.params.id);

    if (!subCategory) {
      return res.status(404).json({ message: "Sub-category not found." });
    }

    res.status(200).json({ message: "Sub-category deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.getSubcategoriesByCategoryId = async (req, res) => {
  try {
    const { categoryId } = req.params;
    console.log(categoryId);
    const subcategories = await SubCategory.find({ category: categoryId });
    res.status(200).json(subcategories);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
