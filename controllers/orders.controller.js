const OrderSchema = require("../models/OrderSchema");

// @desc    Get all orders (admin or user)
exports.getAllOrders = async (req, res) => {
  try {
    const isAdmin = req.user?.role === "admin";

    const query = isAdmin
      ? {} // admin gets all orders
      : { userId: req.user.id }; // user gets only their orders

    const orders = await OrderSchema.find(query)
      .populate("userId", "name email")
      .populate("products.productId", "name price image");

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ GET /api/orders/my - Get orders for logged-in user
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await OrderSchema.find({ userId })
      .populate("products.productId", "name image price") // Optional: populate product details
      .sort({ createdAt: -1 }); // Latest first

    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
