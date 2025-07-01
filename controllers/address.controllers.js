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
    const { index } = req.params;
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
    if (!user || !user.addresses[index]) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    if (isDefault) {
      // Reset all other addresses' default flag
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    user.addresses[index] = {
      name,
      phone,
      pincode,
      street,
      city,
      state,
      addressType,
      isDefault,
    };

    await user.save();

    res.json({
      success: true,
      message: "Address updated",
      data: user.addresses,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const { index } = req.params;

    const user = await User.findById(req.user.id);
    if (!user || !user.addresses[index]) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    const wasDefault = user.addresses[index].isDefault;
    user.addresses.splice(index, 1);

    // If deleted one was default, set first address as default (if exists)
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.json({
      success: true,
      message: "Address deleted",
      data: user.addresses,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
