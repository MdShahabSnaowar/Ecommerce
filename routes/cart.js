const express = require("express");
const router = express.Router();
const { Cart, FruitsVegProduct, GroceryProduct, LabTest, MedicineProduct, MilkProduct } = require("../models");
const authUserOrAdmin = require("../middleware/authUserOrAdmin");
const authMiddleware = require("../middleware/authMiddleware");
// const MedicineProduct = require("../models/MedicineProduct");

const typeMap = {
  FruitsVegProduct: { key: "fruitsveg", enumValue: "FruitsVegProduct" },
  GroceryProduct: { key: "grocery", enumValue: "GroceryProduct" },
  LabTest: { key: "labtest", enumValue: "LabTest" },
  Medicine: { key: "medicine", enumValue: "Medicine" },
  MilkProduct: { key: "milk", enumValue: "MilkProduct" },
};

async function findProductByType(productId, type) {
  try {
    const typeInfo = typeMap[type];
    if (!typeInfo) {
      console.log(`❌ Invalid product type: ${type}`);
      return null;
    }

    const models = {
      fruitsveg: FruitsVegProduct,
      grocery: GroceryProduct,
      labtest: LabTest,
      medicine: MedicineProduct,
      milk: MilkProduct,
    };

    const model = models[typeInfo.key];
    const product = await model.findById(productId);

    if (product) {
      return { product, itemType: typeInfo.enumValue }; // ✅ match enum
    }

    console.log(`❌ Product not found: ${productId} (type: ${type})`);
    return null;
  } catch (err) {
    console.error("❌ Error finding product by type:", err);
    return null;
  }
}



// 🛒 Create a new empty cart
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const existingCart = await Cart.findOne({ userId });
    if (existingCart) {
      return res.status(400).json({ message: "Cart already exists for user" });
    }

    const cart = new Cart({ userId, items: [], totalPrice: 0 });
    await cart.save();
    res.status(201).json({ message: "New cart created", data: cart });
  } catch (err) {
    console.error("Error creating cart:", err);
    res.status(500).json({ message: "Error creating cart", error: err.message });
  }
});

// 🛒 Add item(s) to cart
// router.post("/add", authUserOrAdmin, async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const items = Array.isArray(req.body) ? req.body : [req.body];

//     let cart = await Cart.findOne({ userId });
//     if (!cart) {
//       cart = new Cart({ userId, items: [], totalPrice: 0 });
//     }

//     for (const { productId, quantity, type } of items) {
//       if (!productId || !quantity || quantity < 1 || !type) {
//         console.log(`⚠️ Skipping invalid item: ${JSON.stringify({ productId, quantity, type })}`);
//         continue;
//       }

//       const result = await findProductByType(productId, type);
//       if (!result) {
//         console.log(`⚠️ Product lookup failed: ${productId} (type: ${type})`);
//         continue;
//       }

//       const { product, itemType } = result;
//       const priceAtAdd = product.price * quantity;
//       const productName = product.name;

//       const existingIndex = cart.items.findIndex(
//         (item) =>
//           item.productId.toString() === productId.toString() &&
//           item.itemType === itemType
//       );

//       if (existingIndex > -1) {
//         cart.items[existingIndex].quantity += quantity;
//         cart.items[existingIndex].priceAtAdd += priceAtAdd;
//         cart.items[existingIndex].productName = productName;
//       } else {
//         cart.items.push({
//           productId,
//           productName,
//           quantity,
//           priceAtAdd,
//           itemType,
//         });
//       }
//     }

//     cart.totalPrice = cart.items.reduce((total, item) => total + item.priceAtAdd, 0);
//     cart.updatedAt = Date.now();
//     await cart.save();

//     const formattedItems = cart.items.map((item) => ({
//       _id: item._id,
//       productId: item.productId,
//       productName: item.productName,
//       quantity: item.quantity,
//       priceAtAdd: item.priceAtAdd,
//       itemType: item.itemType,
//     }));

//     res.status(200).json({
//       message: "Items added to cart",
//       data: {
//         _id: cart._id,
//         userId: cart.userId,
//         items: formattedItems,
//         totalPrice: cart.totalPrice,
//         updatedAt: cart.updatedAt,
//         createdAt: cart.createdAt,
//         __v: cart.__v,
//       },
//     });
//   } catch (err) {
//     console.error("❌ Cart Add Error:", err);
//     res.status(500).json({ message: "Error adding items", error: err.message });
//   }
// });


const Subscription = require("../models/subscriptionSchema");
const Plan = require("../models/planSchema");

router.post("/add", authUserOrAdmin, async (req, res) => {
  try {
    const userId = req.user.id;
    const items = Array.isArray(req.body) ? req.body : [req.body];

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [], totalPrice: 0 });
    }

    for (const { productId, quantity, type } of items) {
      if (!productId || !quantity || quantity < 1 || !type) {
        console.log(`⚠️ Skipping invalid item: ${JSON.stringify({ productId, quantity, type })}`);
        continue;
      }

      // ✅ Check subscription for MilkProduct
      if (type === "MilkProduct") {
        const subscription = await Subscription.findOne({
          userId,
          status: "active",
          endDate: { $gte: new Date() },
        });

        if (!subscription) {
          return res.status(200).json({
            message: "Milk product can't be added. No active subscription.",
            error: true,
            data: null,
          });
        }

        const plan = await Plan.findById(subscription.planId);
        if (!plan || !plan.benefits?.milkAccess) {
          return res.status(200).json({
            message: "Milk product can't be added. Your plan doesn't include milk access.",
            error: true,
            data: null,
          });
        }
      }

      const result = await findProductByType(productId, type);
      if (!result) {
        console.log(`⚠️ Product lookup failed: ${productId} (type: ${type})`);
        continue;
      }

      const { product, itemType } = result;
      const priceAtAdd = product.price * quantity;
      const productName = product.name;

      const existingIndex = cart.items.findIndex(
        (item) =>
          item.productId.toString() === productId.toString() &&
          item.itemType === itemType
      );

      if (existingIndex > -1) {
        cart.items[existingIndex].quantity += quantity;
        cart.items[existingIndex].priceAtAdd += priceAtAdd;
        cart.items[existingIndex].productName = productName;
      } else {
        cart.items.push({
          productId,
          productName,
          quantity,
          priceAtAdd,
          itemType,
        });
      }
    }

    cart.totalPrice = cart.items.reduce((total, item) => total + item.priceAtAdd, 0);
    cart.updatedAt = Date.now();
    await cart.save();

    const formattedItems = cart.items.map((item) => ({
      _id: item._id,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      priceAtAdd: item.priceAtAdd,
      itemType: item.itemType,
    }));

    res.status(200).json({
      message: "Items added to cart",
      error: false,
      data: {
        _id: cart._id,
        userId: cart.userId,
        items: formattedItems,
        totalPrice: cart.totalPrice,
        updatedAt: cart.updatedAt,
        createdAt: cart.createdAt,
        __v: cart.__v,
      },
    });
  } catch (err) {
    console.error("❌ Cart Add Error:", err);
    res.status(500).json({ message: "Error adding items", error: true });
  }
});



// 🛒 Get user cart


router.get("/", authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "No cart found for user" });
    }

    const populatedItems = await Promise.all(
      cart.items.map(async (item) => {
        const result = await findProductByType(item.productId, item.itemType);
        const product = result?.product;

        return {
          ...item.toObject(),
          name: product?.name || null,
          image: product?.image || null,
        };
      })
    );

    res.status(200).json({
      message: "Cart fetched",
      data: {
        ...cart.toObject(),
        items: populatedItems,
      },
    });
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ message: "Error fetching cart", error: err.message });
  }
});

// 🗑️ Remove item from cart

router.post("/remove", authMiddleware, async (req, res) => {
  try {
    const { productId, itemType, decreaseBy } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!productId || !itemType) {
      return res.status(400).json({ message: "productId and itemType are required" });
    }

    const decreaseAmount = Number(decreaseBy);
    if (decreaseBy && (isNaN(decreaseAmount) || decreaseAmount <= 0)) {
      return res.status(400).json({ message: "decreaseBy must be a positive number" });
    }

    // Find the cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the item in the cart
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId && item.itemType === itemType
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    const item = cart.items[itemIndex];
    const pricePerUnit = Number(item.priceAtAdd) / Number(item.quantity); // Calculate price per unit

    // Log initial state for debugging
    // console.log(`Initial: quantity=${item.quantity}, priceAtAdd=${item.priceAtAdd}, cart.totalPrice=${cart.totalPrice}`);

    // Handle quantity reduction or full removal
    if (decreaseAmount > 0) {
      // Validate decreaseAmount does not exceed current quantity
      if (decreaseAmount > item.quantity) {
        return res.status(400).json({ message: `Cannot decrease by ${decreaseAmount}, only ${item.quantity} items in cart` });
      }

      // Deduct price based on the price per unit for the quantity being removed
      const deduction = decreaseAmount * pricePerUnit;
      // console.log(`Deducting: ${decreaseAmount} * ${pricePerUnit} = ${deduction}`);
      cart.totalPrice -= deduction;
      if (cart.totalPrice < 0) cart.totalPrice = 0;

      item.quantity -= decreaseAmount;
      item.priceAtAdd = item.quantity * pricePerUnit; // Update priceAtAdd to reflect new quantity
      // console.log(`After reduction: quantity=${item.quantity}, priceAtAdd=${item.priceAtAdd}, cart.totalPrice=${cart.totalPrice}`);

      // Remove item if quantity becomes 0 or less
      if (item.quantity <= 0) {
        // console.log(`Removing item: quantity=${item.quantity}`);
        cart.items.splice(itemIndex, 1);
      }
    } else {
      // Full item removal
      const deduction = Number(item.quantity) * pricePerUnit;
      // console.log(`Full removal: deducting ${item.quantity} * ${pricePerUnit} = ${deduction}`);
      cart.totalPrice -= deduction;
      if (cart.totalPrice < 0) cart.totalPrice = 0;
      cart.items.splice(itemIndex, 1);
    }

    cart.updatedAt = new Date();

    // Delete cart if empty
    if (cart.items.length === 0) {
      // console.log("Cart is empty, deleting cart");
      await Cart.deleteOne({ _id: cart._id });
      return res.status(200).json({ message: "Item removed and empty cart deleted","data":[] });
    }

    cart.markModified("items");
    await cart.save();

    // Log final state
    // console.log(`Final: cart.totalPrice=${cart.totalPrice}, items.length=${cart.items.length}`);

    // Format response
    const formattedItems = cart.items.map(item => ({
      _id: item._id,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      priceAtAdd: item.priceAtAdd,
      itemType: item.itemType
    }));

    return res.status(200).json({
      message: "Cart updated successfully",
      data: {
        _id: cart._id,
        userId: cart.userId,
        items: formattedItems,
        totalPrice: cart.totalPrice,
        updatedAt: cart.updatedAt,
        createdAt: cart.createdAt,
        __v: cart.__v
      }
    });

  } catch (err) {
    console.error("Error removing item:", err);
    res.status(500).json({ message: "Error removing item", error: err.message });
  }
});



module.exports = router;