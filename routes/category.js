const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const Category = require("../models/Category");

// Create category
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, route } = req.body;
    const image = req.file?.filename;

    const category = new Category({ title, route, image });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { title, route } = req.body;
    const updateData = { title, route };

    if (req.file) {
      updateData.image = req.file.filename;
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
