const express = require("express");
const upload = require("../config/multer");
const router = express.Router();
const {
  createDepartment,
  deleteDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
} = require("../controllers/department.controller");

router.post("/create", upload.single("image"), createDepartment);
router.get("/", getAllDepartments);
router.get("/:id", getDepartmentById);
router.put("/:id", upload.single("image"), updateDepartment);
router.delete("/:id", deleteDepartment);

module.exports = router;
