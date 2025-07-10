const Department = require("../models/doctor-appointment");

// CREATE
exports.createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;
    const image = req.file ? req.file.filename : null;
    // console.log("Received file:", req.file);
    const department = new Department({ name, description, image });
    await department.save();

    res.status(201).json(department);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET ALL
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ONE
exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department)
      return res.status(404).json({ error: "Department not found" });
    res.json(department);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
exports.updateDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;
    const image = req.file ? req.file.path : undefined;

    const updateData = { name, description };
    if (image) updateData.image = image;

    const updated = await Department.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated)
      return res.status(404).json({ error: "Department not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE
exports.deleteDepartment = async (req, res) => {
  try {
    const deleted = await Department.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ error: "Department not found" });
    res.json({ message: "Department deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
