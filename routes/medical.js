const express = require("express");
const medicineProductController = require('../controllers/medicine.controllers');
// const {
//   createMedicalItem,
//   getAllMedicalItems,
//   getMedicalItemById,
//   updateMedicalItem,
//   deleteMedicalItem,
// } = require("../controllers/medicine.controllers");
const router = express.Router();
const presciptions = require("../models/presciptions");

const authAdmin = require("../middleware/authAdmin");
const authUserOrAdmin = require("../middleware/authUserOrAdmin");



const upload = require("../config/multer");
router.post(
  "/presciptions",
  authUserOrAdmin,
  upload.array("images", 5),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { description } = req.body;

      // domain/host for building absolute URL
      const serverUrl = `${req.protocol}://${req.get("host")}`;

      // Build array of public URLs
      const imagePaths = req.files.map(file =>
        `${file.filename}`
      );

      const data = await presciptions.create({
        user: userId,
        images: imagePaths,
        description
      });

      res.status(201).json({ success: true, data });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
);


// READ: Get all images for user
router.get("/presciptions", authUserOrAdmin, async (req, res) => {
  try {
    let data;
    if (req.user.role === "admin") {
      data = await presciptions.find({}).populate("user", "-password");
    } else {
      data = await presciptions.find({ user: req.user.id }).populate("user", "-password");
    }
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});





// UPDATE: Update description/images by ID
router.put(
  "/presciptions/:id",
  authUserOrAdmin, // Authentication and user info
  upload.array("images", 5),
  async (req, res) => {
    try {
      // Step 1: Fetch the prescription by ID
      const prescription = await presciptions.findById(req.params.id);
      if (!prescription) {
        return res.status(404).json({ success: false, message: "Prescription not found" });
      }

      // Step 2: Check ownership (only owner can update, except admin)
      // If you want admin to update any record, add: || req.user.role === "admin"
      if (prescription.user.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: "You are not authorized to update this prescription" });
      }

      // Step 3: Build update object
      const { description } = req.body;
      const updateObj = {};
      if (description) updateObj.description = description;
      if (req.files && req.files.length > 0) {
        const serverUrl = `${req.protocol}://${req.get("host")}`;
        updateObj.images = req.files.map(file =>
          `${file.filename}`
        );
      }

      // Step 4: Perform update
      const data = await presciptions.findByIdAndUpdate(
        req.params.id,
        updateObj,
        { new: true }
      );
      res.json({ success: true, data });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
);



// DELETE: Remove an image collection by ID
router.delete(
  "/presciptions/:id",
  authUserOrAdmin, // <-- Ensure middleware here
  async (req, res) => {
    try {
      // Step 1: Fetch prescription by ID
      const prescription = await presciptions.findById(req.params.id);
      if (!prescription) {
        return res.status(404).json({ success: false, message: "Prescription not found" });
      }

      // Step 2: Only admin or the owner can delete
      if (
        prescription.user.toString() !== req.user.id &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({ success: false, message: "You are not authorized to delete this prescription" });
      }

      // Step 3: Delete prescription
      await presciptions.findByIdAndDelete(req.params.id);

      res.json({ success: true, message: "Deleted successfully" });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
);


module.exports = router;
