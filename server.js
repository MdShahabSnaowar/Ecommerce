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
const SuperCoin = require("./models/SuperCoinSchema");
const Order = require("./models/OrderSchema");
const authAdmin = require("./middleware/authAdmin");
const authMiddleware = require("./middleware/authMiddleware");
const Cart = require("./models/Cart");
const FruitsVegProduct = require("./models/FruitsVegProduct");
const GroceryProduct = require("./models/GroceryProduct");
const MedicineProduct = require("./models/MedicineProduct");
const MilkProduct = require("./models/MilkProduct");
const LabTest = require("./models/labtest");
const Subscription = require("./models/subscriptionSchema");
const sendEmail = require("./utils/sendEmail");

const crypto = require("crypto");

dotenv.config();
connectDB();

const cron = require("node-cron");


//  Run every day at midnight (00:00)
cron.schedule("0 0 * * *", async () => {
  try {
    const now = new Date();

    // 🔍 Find all expiring subscriptions first
    const expiringSubscriptions = await Subscription.find({
      endDate: { $lt: now },
      status: "active",
    });

    // 🔁 For each one, update status & notify user
    for (const sub of expiringSubscriptions) {
      sub.status = "expired";
      await sub.save();

      const user = await User.findById(sub.userId);
      if (user && user.email) {
        await sendEmail(
          user.email,
          "Subscription Expired",
          `Dear ${user.name || "User"},\n\nYour subscription has expired. Please renew to continue enjoying benefits.\n\nThank you!`
        );
      }
    }

    console.log(
      `✅ Subscription Expiry Job: ${expiringSubscriptions.length} subscriptions marked as expired and notified.`
    );
  } catch (err) {
    console.error("❌ Subscription Expiry Job Failed:", err.message);
  }
});

//  Run every 5 sec for tsting to expire the subscriptions
// cron.schedule("*/5 * * * * *", async () => {
//   try {
//     const now = new Date();

//     const expiredSubscriptions = await Subscription.updateMany(
//       {
//         endDate: { $lt: now },
//         status: "active",
//       },
//       {
//         $set: { status: "expired" },
//       }
//     );

//     console.log(
//       `✅ Subscription Expiry Job: ${expiredSubscriptions.modifiedCount} subscriptions marked as expired.`
//     );
//   } catch (err) {
//     console.error("❌ Subscription Expiry Job Failed:", err.message);
//   }
// });


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
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
app.use("/api/medical", require("./routes/medical"));
app.use("/api/grocery/", require("./routes/groceryCategoryRoutes"));
app.use("/api/filter/", require("./routes/filterfruitsVegRoutes"));
app.use("/api/everything/", require("./routes/filtergroceryRoutes"));

app.use("/api/lab-test-filter/", require("./routes/filterRoutes"));
app.use(
  "/api/grocery/subcategories",
  require("./routes/grocerySubcategoryRoutes")
);

app.use("/api/grocery/products", require("./routes/groceryProductRoutes"));
app.use("/api/fruits-vegetables", require("./routes/fruitsVegRoutes"));
app.use("/api/milk", require("./routes/milkcategory"));
app.use("/api/milk-products", require("./routes/milkProduct.routes"));
app.use("/api/book-slot", require("./routes/appointment"));

const getProductDetails = async (type, productId) => {
  let productModel;

  switch (type) {
    case "FruitsVegProduct":
      productModel = FruitsVegProduct;
      break;
    case "GroceryProduct":
      productModel = GroceryProduct;
      break;
    case "Medicine":
      productModel = MedicineProduct;
      break;
    case "MilkProduct":
      productModel = MilkProduct;
      break;
    case "LabTest":
      productModel = LabTest;
      break;
    default:
      // console.log("🚫 Unknown product type:", type); // debug
      return null;
  }

  const product = await productModel.findById(productId);
  if (!product) {
    // console.log(`⚠️ Product not found: ${type} - ${productId}`);
  }

  return product;
};


app.post("/api/payment/order", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      cartId,
      paymentMode,
      addressId,
      expressDelivery,
      useSuperCoins = false,
      coinsToUse = 0,
    } = req.body;

    if (!cartId || !paymentMode || !addressId) {
      return res
        .status(400)
        .json({ message: "cartId, paymentMode, and addressId are required" });
    }

    if (!["online", "COD"].includes(paymentMode)) {
      return res
        .status(400)
        .json({ message: "Invalid payment mode. Choose 'online' or 'COD'" });
    }

    if (paymentMode === "COD" && useSuperCoins) {
      return res.status(400).json({
        message: "SuperCoins cannot be used with Cash on Delivery (COD)",
      });
    }

    const cart = await Cart.findOne({ _id: cartId, userId });
    if (!cart || !cart.items.length) {
      return res
        .status(400)
        .json({ message: "Cart not found, not yours, or empty" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const selectedAddress = user.addresses.id(addressId);
    if (!selectedAddress) {
      return res
        .status(404)
        .json({ message: "Address not found or doesn't belong to user" });
    }

    let amount = cart.totalPrice;
    if (expressDelivery === true) {
      amount += 25;
    }

    let superCoinDiscount = 0;

    if (useSuperCoins) {
      const superCoinData = await SuperCoin.findOne({ userId });
      const availableCoins = superCoinData?.coins || 0;

      if (coinsToUse > availableCoins) {
        return res.status(400).json({
          message: `You only have ${availableCoins} SuperCoins. You cannot use ${coinsToUse}.`,
        });
      }

      superCoinDiscount = coinsToUse;
      amount -= superCoinDiscount;
      if (amount < 0) amount = 0;
    }

    if (amount <= 0) {
      return res
        .status(400)
        .json({ message: "Cart total must be greater than zero" });
    }

    const formattedProducts = await Promise.all(
      cart.items.map(async (item) => {
        const product = await getProductDetails(item.itemType, item.productId);
        return {
          productId: item.productId,
          name: product?.name || "",
          image: product?.image || "",
          quantity: item.quantity,
          priceAtPurchase: item.priceAtAdd,
          productType: item.itemType,
        };
      })
    );
    
    const order = new OrderSchema({
      userId,
      products: formattedProducts,
      totalAmount: amount,
      status: paymentMode === "COD" ? "OrderPlaced" : "OrderPlaced",
      deliveryAddress: selectedAddress,
      expressDelivery: expressDelivery === true,
    });

    await order.save();

    let paymentData = {
      orderId: order._id,
      userId,
      amount,
      status: "pending",
    };

    if (paymentMode === "online") {
      const options = {
        amount: Number(amount * 100),
        currency: "INR",
        receipt: `order_rcptid_${Date.now()}`,
        notes: {
          userId,
          cartId,
          expressDelivery: expressDelivery === true,
          useSuperCoins,
          coinsToUse,
        },
      };

      const razorpayOrder = await razorpay.orders.create(options);

      paymentData = {
        ...paymentData,
        transactionId: razorpayOrder.id,
      };

      const payment = new Payment(paymentData);
      await payment.save();

      return res.json({
        razorpayOrder,
        orderId: order._id,
        paymentMode,
        expressDelivery: expressDelivery === true,
        superCoinUsed: useSuperCoins,
        coinsUsed: coinsToUse,
        superCoinDiscount,
      });
    } else if (paymentMode === "COD") {
      paymentData = {
        ...paymentData,
        transactionId: `COD_${Date.now()}`,
        signature: "N/A",
        status: "pending",
      };

      const payment = new Payment(paymentData);
      await payment.save();

      await Cart.deleteOne({ _id: cartId });

      return res.json({
        message: "COD Order placed successfully",
        orderId: order._id,
        paymentMode,
        expressDelivery: expressDelivery === true,
        superCoinUsed: useSuperCoins,
        coinsUsed: coinsToUse,
        superCoinDiscount,
      });
    }
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});




app.post("/api/payment/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      cartId,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;

    const payment = await Payment.findOne({ transactionId: razorpay_order_id });

    if (!payment) {
      return res.status(404).json({ status: "Payment not found in DB" });
    }

    if (isValid) {
      payment.status = "completed";
      payment.signature = razorpay_signature;
      await payment.save();

      const cart = await Cart.findById(cartId).populate("items.productId");

      if (cart) {
        const userId = cart.userId;

        // 🪙 Deduct SuperCoins if used
        const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);
        const { notes } = razorpayOrder;

        if (notes?.useSuperCoins === "true" && Number(notes.coinsToUse) > 0) {
          const coinsToUse = Number(notes.coinsToUse);

          let superCoinData = await SuperCoin.findOne({ userId });
          if (superCoinData) {
            const availableCoins = superCoinData.coins || 0;

            if (coinsToUse <= availableCoins) {
              superCoinData.coins -= coinsToUse;
              superCoinData.history.push({
                type: "redeem",
                coins: coinsToUse,
                description: `Used ${coinsToUse} coins for order payment`,
              });
              await superCoinData.save();
            }
          }
        }

        // ✅ SuperCoin reward logic removed
      }

      await Cart.deleteOne({ _id: cartId });

      return res.json({ status: "Payment verified and marked completed" });
    } else {
      payment.status = "failed";
      await payment.save();

      return res
        .status(400)
        .json({ status: "Invalid signature. Payment marked failed" });
    }
  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({ status: "Internal server error" });
  }
});


app.get("/api/get-profile", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .select("-password")
      .populate("referredBy", "mobile email");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User profile fetched",
      user,
    });
  } catch (err) {
    console.error("User fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


const multer = require("multer");
const upload = require("./config/multer"); // shared config

// ✅ Wrap multer middleware with error handling manually
app.put("/api/user/update", authMiddleware, (req, res, next) => {
  upload.single("profilePhoto")(req, res, (err) => {
    if (err) {
      if (
        err.message === "Only images or JSON files are allowed" ||
        err instanceof multer.MulterError
      ) {
        return res.status(400).json({
          success: false,
          message: "File upload error",
          error: err.message,
        });
      }

      // Pass unexpected errors
      return next(err);
    }

    // Proceed to main logic if no multer error
    next();
  });
}, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      mobile,
      dateOfBirth,
      gender,
      nationality,
    } = req.body;

    const updateFields = {};
    if (name) updateFields.name = name;
    if (mobile) updateFields.mobile = mobile;
    if (dateOfBirth) updateFields.dateOfBirth = dateOfBirth;
    if (gender) updateFields.gender = gender;
    if (nationality) updateFields.nationality = nationality;

    // ✅ Image file received
    if (req.file) {
      updateFields.profilePhoto = `/uploads/${req.file.filename}`;
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    Object.assign(user, updateFields);
    await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: err.message,
    });
  }
});

app.get("/api/milk-sales/monthly", authAdmin, async (req, res) => {
  try {
    const milkSales = await Order.aggregate([
      { $unwind: "$products" },
      { $match: { "products.productType": "MilkProduct" } },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: "%d %B", date: "$createdAt" }, // e.g., 13 July
            },
            productId: "$products.productId",
            productName: "$products.name",
          },
          totalSale: { $sum: "$products.priceAtPurchase" },
          totalQuantity: { $sum: "$products.quantity" },
        },
      },
      {
        $sort: {
          "_id.date": 1,
        },
      },
    ]);

    // 🔁 Populate full MilkProduct details
    const enriched = await Promise.all(
      milkSales.map(async (entry) => {
        const productDetail = await MilkProduct.findById(entry._id.productId).lean();
        return {
          date: entry._id.date,
          productName: entry._id.productName,
          productType: "MilkProduct",
          totalSale: entry.totalSale,
          totalQuantity: entry.totalQuantity,
          productDetails: productDetail || null,
        };
      })
    );

    const totalMonthlySale = enriched.reduce((sum, curr) => sum + curr.totalSale, 0);

    res.status(200).json({
      message: enriched.length ? "Milk sales fetched successfully" : "No milk sales found",
      records: enriched,
      totalMonthlySale,
    });
  } catch (error) {
    console.error("Error fetching milk sales:", error);
    res.status(500).json({ message: "Failed to fetch milk sales", error: error.message });
  }
});

app.get("/api/search-product/:name", async (req, res) => {
  const nameToSearch = req.params.name;


  try {
    const exactMatchQuery = {
      name: { $regex: new RegExp(`^${nameToSearch}$`, "i") },
    };
    const partialMatchQuery = {
      name: { $regex: new RegExp(nameToSearch, "i") },
    };

    const [exactFruits, exactGrocery, exactMedicine, exactMilk] =
      await Promise.all([
        FruitsVegProduct.find(exactMatchQuery),
        GroceryProduct.find(exactMatchQuery),
        MedicineProduct.find(exactMatchQuery),
        MilkProduct.find(exactMatchQuery),
      ]);

    const [partialFruits, partialGrocery, partialMedicine, partialMilk] =
      await Promise.all([
        FruitsVegProduct.find(partialMatchQuery),
        GroceryProduct.find(partialMatchQuery),
        MedicineProduct.find(partialMatchQuery),
        MilkProduct.find(partialMatchQuery),
      ]);

    const results = [];

    const mergeResults = (exact, partial, sourceType) => {
      const uniquePartial = partial.filter(
        (p) => !exact.some((e) => e._id.toString() === p._id.toString())
      );
      const combined = [...exact, ...uniquePartial].map((product) => ({
        ...product.toObject(),
        product_type: sourceType,
      }));

      if (combined.length > 0) {
        results.push({ source: sourceType, products: combined });
      }
    };
    mergeResults(exactFruits, partialFruits, "FruitsVegProduct");
    mergeResults(exactGrocery, partialGrocery, "GroceryProduct");
    mergeResults(exactMedicine, partialMedicine, "MedicineProduct");
    mergeResults(exactMilk, partialMilk, "MilkProduct");
    if (results.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json({ results });
  } catch (error) {
    console.error("Search Error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
});

