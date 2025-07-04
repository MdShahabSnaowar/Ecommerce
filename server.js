const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const Razorpay = require("razorpay");
const Payment = require("./models/paymentSchema");
const OrderSchema = require("./models/OrderSchema");
const User = require("./models/User");
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

// app.post("/api/payment/order", authMiddleware, async (req, res) => {
//   try {
//     const userId = req.user.id; // From auth middleware
//     const { cartId } = req.body;

//     // Validate cartId
//     if (!cartId) {
//       return res.status(400).json({ error: "cartId is required" });
//     }

//     // Fetch the cart and verify it belongs to the user
//     const cart = await Cart.findOne({ _id: cartId, userId });
//     if (!cart) {
//       return res.status(404).json({ error: "Cart not found or does not belong to user" });
//     }

//     if (!cart.items.length) {
//       return res.status(400).json({ error: "Cart is empty" });
//     }

//     // Use cart's totalPrice as amount
//     const amount = cart.totalPrice;
//     if (amount <= 0) {
//       return res.status(400).json({ error: "Cart total price must be greater than zero" });
//     }

//     // Create Razorpay order
//     const options = {
//       amount: Number(amount * 100), // Convert to paise
//       currency: "INR",
//       receipt: `order_rcptid_${Date.now()}`,
//       notes: {
//         userId,
//         cartId,
//       },
//     };

//     const razorpayOrder = await razorpay.orders.create(options);
//     console.log("Cart items:", cart.items);

//     // Format cart items to match OrderSchema
//     const formattedProducts = cart.items.map((item) => ({
//       productId: item.productId,
//       quantity: item.quantity,
//       priceAtPurchase: item.priceAtAdd, // Rename to match OrderSchema
//     }));

//     console.log("Formatted products:", formattedProducts);

//     // Save to DB
//     const order = new OrderSchema({
//       userId,
//       products: formattedProducts,
//       totalAmount: amount,
//       // status is "pending" by default
//       // paymentId will be updated after payment is captured
//     });


//     await order.save();

//     // Calculate and add supercoins
//     const earnedCoins = Math.floor(amount / 150);
//     if (earnedCoins > 0) {
//       const { addCoins } = require("./controllers/supercoins.controllers");
//       await addCoins(userId, earnedCoins, "purchase", `Earned from order ₹${amount}`);
//     }

//     res.json({
//       razorpayOrder,
//       orderId: order._id,
//     });
//   } catch (err) {
//     console.error("Order creation error:", err);
//     res.status(500).json({ error: "Failed to create order" });
//   }
// });

app.post("/api/payment/order", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartId, paymentMode, addressId, expressDelivery } = req.body;

    if (!cartId || !paymentMode || !addressId) {
      return res.status(400).json({ message: "cartId, paymentMode, and addressId are required" });
    }

    if (!["online", "COD"].includes(paymentMode)) {
      return res.status(400).json({ message: "Invalid payment mode. Choose 'online' or 'COD'" });
    }

    const cart = await Cart.findOne({ _id: cartId, userId });
    if (!cart || !cart.items.length) {
      return res.status(400).json({ message: "Cart not found, not yours, or empty" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const selectedAddress = user.addresses.id(addressId);
    if (!selectedAddress) {
      return res.status(404).json({ message: "Address not found or doesn't belong to user" });
    }

    // 🧮 Total amount calculation
    let amount = cart.totalPrice;
    if (expressDelivery === true) {
      amount += 20; // Add ₹20 for express delivery
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Cart total must be greater than zero" });
    }

    const formattedProducts = cart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      priceAtPurchase: item.priceAtAdd,
    }));

    // Step 1: Create Order
    const order = new OrderSchema({
      userId,
      products: formattedProducts,
      totalAmount: amount,
      status: paymentMode === "COD" ? "shipped" : "shipped",
      deliveryAddress: selectedAddress,
      expressDelivery: expressDelivery === true, // 🟢 save express flag
    });

    await order.save();

    // Step 2: Handle payment
    let paymentData = {
      orderId: order._id,
      userId,
      amount,
      status: "pending",
    };

    if (paymentMode === "online") {
      const options = {
        amount: Number(amount * 100), // ₹ to paise
        currency: "INR",
        receipt: `order_rcptid_${Date.now()}`,
        notes: { userId, cartId, expressDelivery: expressDelivery === true },
      };

      const razorpayOrder = await razorpay.orders.create(options);

      paymentData = {
        ...paymentData,
        transactionId: razorpayOrder.id,
      };

      const payment = new Payment(paymentData);
      await payment.save();

      await Cart.deleteOne({ _id: cartId });

      return res.json({
        razorpayOrder,
        orderId: order._id,
        paymentMode,
        expressDelivery: expressDelivery === true,
      });
    } else if (paymentMode === "COD") {
      paymentData = {
        ...paymentData,
        transactionId: `COD_${Date.now()}`,
        signature: "N/A",
        status: "shipped",
      };

      const payment = new Payment(paymentData);
      await payment.save();

      await Cart.deleteOne({ _id: cartId });

      return res.json({
        message: "COD Order placed successfully",
        orderId: order._id,
        paymentMode,
        expressDelivery: expressDelivery === true,
      });
    }
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});




// Verify payment signature (unchanged)
app.post("/api/payment/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;

    // 🧠 Get payment entry using transactionId = razorpay_order_id
    const payment = await Payment.findOne({ transactionId: razorpay_order_id });

    if (!payment) {
      return res.status(404).json({ status: "Payment not found in DB" });
    }

    if (isValid) {
      payment.status = "completed";
      payment.signature = razorpay_signature;
      await payment.save();

      return res.json({ status: "Payment verified and marked completed" });
    } else {
      payment.status = "failed";
      await payment.save();

      return res.status(400).json({ status: "Invalid signature. Payment marked failed" });
    }
  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({ status: "Internal server error" });
  }
});







const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
