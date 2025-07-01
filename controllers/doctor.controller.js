const Doctor = require("../models/doctor.schema");

// Create Doctor
exports.createDoctor = async (req, res) => {
  try {
    const {
      name,
      degrees,
      specialization,
      departmentId,
      experience,
      fee,
      description,
      address,
    } = req.body;

    const availability = JSON.parse(req.body.availability || "[]");

    const doctor = await Doctor.create({
      name,
      degrees,
      specialization: specialization.split(","),
      departmentId,
      experience: experience,
      clinic: {
        address,
      },
      availability,
      fee,
      description,
      image: req.file ? `${req.file.filename}` : undefined,
    });

    res.status(201).json({ success: true, data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update Doctor
exports.updateDoctor = async (req, res) => {
  try {
    const {
      name,
      degrees,
      specialization,
      departmentId,
      experienceTotal,
      experienceSpecialist,
      fee,
      description,
      address,
    } = req.body;

    const availability = JSON.parse(req.body.availability || "[]");

    const updatedData = {
      name,
      degrees,
      specialization: specialization.split(","),
      departmentId,
      experience: {
        total: experienceTotal,
        asSpecialist: experienceSpecialist,
      },
      clinic: {
        address,
      },
      availability,
      fee,
      description,
    };

    if (req.file) {
      updatedData.image = `/uploads/doctors/${req.file.filename}`;
    }

    const doctor = await Doctor.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
    });

    if (!doctor)
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });

    res.json({ success: true, data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete Doctor
exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor)
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    res.json({ success: true, message: "Doctor deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Doctors by Department ID
exports.getDoctorsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    const doctors = await Doctor.find({ departmentId }).populate(
      "departmentId",
      "name"
    );

    if (!doctors || doctors.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No doctors found for this department",
      });
    }

    res.json({ success: true, data: doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get All Doctors
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate("departmentId", "name");
    res.json({ success: true, data: doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate(
      "departmentId",
      "name"
    );
    if (!doctor)
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    res.json({ success: true, data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
