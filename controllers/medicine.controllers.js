const Medicine = require("../models/medicines");

// Create
exports.createMedicine = async (req, res) => {
  try {
    const image = req.file ? `${req.file.filename}` : "";

    const medicine = await Medicine.create({ ...req.body, image });

    res.status(201).json({ success: true, data: medicine });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message.includes("mrp") ? "Invalid MRP value" : err.message,
    });
  }
};

// Read all
exports.getAllMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find().sort({ createdAt: -1 });
    res.json({ success: true, data: medicines });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Read one
exports.getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    res.json({ success: true, data: medicine });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update
exports.updateMedicine = async (req, res) => {
  try {
    const image = req.file ? `${req.file.filename}` : undefined;

    const updateData = { ...req.body };
    if (image) updateData.image = image;

    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!medicine) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true, data: medicine });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete
exports.deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
