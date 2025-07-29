const healthCheck = require("../models/healthCheck");

// CREATE

exports.createHealthCheck = async (req, res) => {
  try {
    const { title, createdByDoctorId } = req.body;

    const newHealthCheck = new healthCheck({
      title,
      createdByDoctorId,
      image: req.file ? `${req.file.filename}` : undefined,
    });

    await newHealthCheck.save();

    res.status(201).json({ success: true, data: newHealthCheck });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// READ ALL
exports.getAllHealthChecks = async (req, res) => {
  try {
    const healthChecks = await healthCheck.find();
    res.json({ success: true, data: healthChecks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// READ BY ID
exports.getHealthCheckById = async (req, res) => {
  try {
    const healthCheck = await healthCheck.findById(req.params.id);
    if (!healthCheck)
      return res.status(404).json({ success: false, message: "Not found" });

    res.json({ success: true, data: healthCheck });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE
exports.updateHealthCheck = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // If a new image file is uploaded, update the image field
    if (req.file) {
      updateData.image = req.file.filename;
    }

    const updated = await healthCheck.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// DELETE
exports.deleteHealthCheck = async (req, res) => {
  try {
    const deleted = await healthCheck.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ success: false, message: "Not found" });

    res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
