const User = require("../models/User");

// ✅ GET /api/addresses — Get all addresses of current user
exports.getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("addresses");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.json({ success: true, data: user.addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ POST /api/addresses — Add a new address to current user
exports.addAddress = async (req, res) => {
  try {
    const {
      name,
      phone,
      pincode,
      street,
      city,
      state,
      addressType,
      isDefault,
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (isDefault) {
      // Make all other addresses non-default
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    user.addresses.push({
      name,
      phone,
      pincode,
      street,
      city,
      state,
      addressType,
      isDefault,
    });

    await user.save();

    res
      .status(201)
      .json({ success: true, message: "Address added", data: user.addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
exports.updateAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    const {
      name,
      phone,
      pincode,
      street,
      city,
      state,
      addressType,
      isDefault,
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    if (isDefault) {
      // Unset default from all others
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    // Update fields
    address.name = name ?? address.name;
    address.phone = phone ?? address.phone;
    address.pincode = pincode ?? address.pincode;
    address.street = street ?? address.street;
    address.city = city ?? address.city;
    address.state = state ?? address.state;
    address.addressType = addressType ?? address.addressType;
    address.isDefault = isDefault ?? address.isDefault;

    await user.save();

    res.json({
      success: true,
      message: "Address updated successfully",
      data: address,
    });
  } catch (err) {
    console.error("Update Address Error:", err);
    res.status(500).json({ success: false, message: "Failed to update address" });
  }
};
exports.deleteAddress = async (req, res) => {
  try {
    const addressId = req.params.id;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    const wasDefault = address.isDefault;

    // Remove the address using Mongoose subdocument .remove()
    address.remove();

    // If the deleted one was default, set first one as default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.json({
      success: true,
      message: "Address deleted successfully",
      data: user.addresses,
    });
  } catch (err) {
    console.error("Delete Address Error:", err);
    res.status(500).json({ success: false, message: "Failed to delete address" });
  }
};




exports.getAddressById = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const address = user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({ error: "Address not found or unauthorized" });
    }

    res.status(200).json({ address });
  } catch (err) {
    console.error("Fetch Address by ID Error:", err);
    res.status(500).json({ error: "Failed to fetch address" });
  }
};