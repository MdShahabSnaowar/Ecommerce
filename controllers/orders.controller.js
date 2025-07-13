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


exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["shipped", "outfor delivery", "delivered", "cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status provided" });
    }

    const order = await OrderSchema.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // ⛔ Prevent status change if already delivered or cancelled
    if (["delivered", "cancelled"].includes(order.status)) {
      return res.status(400).json({
        error: `Cannot update status. Order is already ${order.status}.`,
      });
    }

    order.status = status;
    await order.save();

    // ✅ Add SuperCoins if delivered
    if (status === "delivered") {
      const userId = order.userId;
      const totalAmount = order.totalAmount;
      const coinsToAdd = Math.floor(totalAmount / 150);

      if (coinsToAdd > 0) {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1); // 🕰️ 6 months expiry

        let superCoin = await SuperCoin.findOne({ userId });
        if (!superCoin) {
          superCoin = new SuperCoin({ userId, coins: 0, history: [] });
        }

        superCoin.coins += coinsToAdd;
        superCoin.history.push({
          type: "purchase",
          coins: coinsToAdd,
          description: `Earned ${coinsToAdd} coin(s) on delivery of order ₹${totalAmount}`,
          expiresAt,
        });

        await superCoin.save();
      }
    }

    res.json({ message: "Order status updated", order });
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ error: "Failed to update order status" });
  }
};
