// routes/doctor.routes.js
const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctor.controller");
const upload = require("../config/multer");

router.post("/create", upload.single("image"), doctorController.createDoctor);
router.put("/:id", upload.single("image"), doctorController.updateDoctor);
router.get("/", doctorController.getAllDoctors);
router.get("/:id", doctorController.getDoctorById);
router.delete("/:id", doctorController.deleteDoctor);
router.get(
  "/department/:departmentId",
  doctorController.getDoctorsByDepartment
);

module.exports = router;
