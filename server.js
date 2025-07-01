const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const Razorpay = require("razorpay");
const OrderSchema = require("./models/OrderSchema");
const authMiddleware = require("./middleware/authMiddleware");
const Cart  = require("./models/Cart");
dotenv.config();
connectDB();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api", require("./routes/auth"));
app.use("/api/products", require("./routes/product"));
app.use("/api/categories", require("./routes/category"));
app.use("/api/subcategories", require("./routes/subcategory"));
app.use("/api/plans", require("./routes/plan"));
app.use("/api/supercoins", require("./routes/supercoin"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/addresses", require("./routes/address"));
app.use("/api/subscriptions", require("./routes/subscription"));
// app.js
app.use("/api/payment", require("./routes/payment"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/departments", require("./routes/departments"));
app.use("/api/doctors", require("./routes/doctor-profile"));
app.use("/api/health-checks", require("./routes/healthCheck.routes"));
app.use("/api/lab-tests", require("./routes/labTest.routes"));
app.use("/api/medicines", require("./routes/medicines"));
app.use("/api/grocery/", require("./routes/groceryCategoryRoutes"));
app.use(
  "/api/grocery/subcategories",
  require("./routes/grocerySubcategoryRoutes")
);

app.use("/api/grocery/products", require("./routes/groceryProductRoutes"));
app.use("/api/fruits-vegetables", require("./routes/fruitsVegRoutes"));
app.use("/api/milk", require("./routes/milkcategory"));
app.use("/api/milk-products", require("./routes/milkProduct.routes"));
app.use("/api/book-slot", require("./routes/appointment"));
// app.use( departmentRoutes);

app.post("/api/payment/order", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const { cartId } = req.body;

    // Validate cartId
    if (!cartId) {
      return res.status(400).json({ error: "cartId is required" });
    }

    // Fetch the cart and verify it belongs to the user
    const cart = await Cart.findOne({ _id: cartId, userId });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found or does not belong to user" });
    }

    if (!cart.items.length) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Use cart's totalPrice as amount
    const amount = cart.totalPrice;
    if (amount <= 0) {
      return res.status(400).json({ error: "Cart total price must be greater than zero" });
    }

    // Create Razorpay order
    const options = {
      amount: Number(amount * 100), // Convert to paise
      currency: "INR",
      receipt: `order_rcptid_${Date.now()}`,
      notes: {
        userId,
        cartId,
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);
    console.log("Cart items:", cart.items);

    // Format cart items to match OrderSchema
    const formattedProducts = cart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      priceAtPurchase: item.priceAtAdd, // Rename to match OrderSchema
    }));

    console.log("Formatted products:", formattedProducts);

    // Save to DB
    const order = new OrderSchema({
      userId,
      products: formattedProducts,
      totalAmount: amount,
      // status is "pending" by default
      // paymentId will be updated after payment is captured
    });

    await order.save();

    // Calculate and add supercoins
    const earnedCoins = Math.floor(amount / 150);
    if (earnedCoins > 0) {
      const { addCoins } = require("./controllers/supercoins.controllers");
      await addCoins(userId, earnedCoins, "purchase", `Earned from order ₹${amount}`);
    }

    res.json({
      razorpayOrder,
      orderId: order._id,
    });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Verify payment signature (unchanged)
app.post("/api/payment/verify", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  const isValid = expectedSignature === razorpay_signature;

  if (isValid) {
    res.json({ status: "Payment verified" });
  } else {
    res.status(400).json({ status: "Invalid signature" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
