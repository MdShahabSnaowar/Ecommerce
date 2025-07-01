const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} = require("../controllers/address.controllers");
const router = express.Router();

// Get all addresses
router.get("/", authMiddleware, getAddresses);

// Add new address
router.post("/create", authMiddleware, addAddress);
router.put("/:id", authMiddleware, updateAddress);
router.delete("/:id", authMiddleware, deleteAddress);

module.exports = router;
