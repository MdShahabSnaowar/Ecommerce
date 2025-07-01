const LabTest = require("../models/labtest");

// Create Lab Test
exports.createLabTest = async (req, res) => {
  try {
    const {
      healthCheck,
      name,
      includedTests,
      price,
      mrp,
      discountPercentage,
      location,
      description,
    } = req.body;

    const image = req.file ? req.file.filename : null;

    const newTest = new LabTest({
      healthCheck,
      name,
      includedTests,
      price,
      mrp,
      discountPercentage,
      location,
      description,
      image,
    });

    await newTest.save();
    res.status(201).json(newTest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Lab Tests
exports.getAllLabTests = async (req, res) => {
  try {
    const tests = await LabTest.find().populate("healthCheck", "title");
    res.json(tests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Lab Test by ID
exports.getLabTestById = async (req, res) => {
  try {
    const test = await LabTest.findById(req.params.id).populate(
      "healthCheck",
      "title"
    );
    if (!test) return res.status(404).json({ error: "Lab test not found" });
    res.json(test);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Lab Test
exports.updateLabTest = async (req, res) => {
  try {
    const data = req.body;
    if (req.file) data.image = req.file.path;

    const updated = await LabTest.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Lab Test
exports.deleteLabTest = async (req, res) => {
  try {
    await LabTest.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLabTestsByHealthCheckId = async (req, res) => {
  try {
    const { healthCheckId } = req.params;
    const labTests = await LabTest.find({ healthCheck: healthCheckId });
    res.json(labTests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
