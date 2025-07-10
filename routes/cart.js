const express = require("express");
const router = express.Router();
const { Cart, FruitsVegProduct, GroceryProduct, LabTest, Medicine, MilkProduct } = require("../models");
const authUserOrAdmin = require("../middleware/authUserOrAdmin");
const authMiddleware = require("../middleware/authMiddleware");

async function findProductByType(productId, type) {
  try {
    const models = {
      FruitsVegProduct,
      GroceryProduct,
      LabTest,
      Medicine,
      MilkProduct,
    };

    const model = models[type];
    if (!model) {
      console.log(`Invalid product type: ${type}`);
      return null;
    }

    const product = await model.findById(productId);
    if (product) {
      // console.log(`Found product ${productId} in ${type}:`, product);
      return { product, itemType: type };
    }

    // console.log(`Product ${productId} not found in ${type}`);
    return null;
  } catch (err) {
    console.error("Error finding product by type:", err);
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
router.post("/add", authUserOrAdmin, async (req, res) => {
  try {
    const userId = req.user.id;
    const items = Array.isArray(req.body) ? req.body : [req.body];

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [], totalPrice: 0 });
      // console.log("Created new cart for user:", userId);
    }

    for (const { productId, quantity, type } of items) {
      if (!productId || !quantity || quantity < 1 || !type) {
        // console.log(`Skipping invalid item: productId=${productId}, quantity=${quantity}, type=${type}`);
        continue;
      }

      const result = await findProductByType(productId, type);
      if (!result) {
        // console.log(`Product not found: ${productId}`);
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
        cart.items[existingIndex].productName = productName; // optional: update name if changed
      } else {
        cart.items.push({ productId, productName, quantity, priceAtAdd, itemType });
      }
    }

    cart.totalPrice = cart.items.reduce((total, item) => total + item.priceAtAdd, 0);
    cart.updatedAt = Date.now();

    await cart.save();

    // format response to include productName explicitly
    const formattedItems = cart.items.map(item => ({
      _id: item._id,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      priceAtAdd: item.priceAtAdd,
      itemType: item.itemType
    }));

    res.status(200).json({
      message: "Items added to cart",
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
    console.error("Cart Add Error:", err);
    res.status(500).json({ message: "Error adding items", error: err.message });
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

    if (!productId || !itemType) {
      return res.status(400).json({ message: "productId and itemType are required" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId && item.itemType === itemType
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Handle quantity reduction
    if (decreaseBy && decreaseBy > 0) {
      cart.items[itemIndex].quantity -= decreaseBy;

      // If quantity becomes 0 or less, remove the item
      if (cart.items[itemIndex].quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      }
    } else {
      // Full item removal (existing behavior)
      cart.items.splice(itemIndex, 1);
    }

    // Recalculate total price
    cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.quantity * item.priceAtAdd,
      0
    );
    cart.updatedAt = Date.now();

    if (cart.items.length === 0) {
      await Cart.deleteOne({ _id: cart._id });
      return res.status(200).json({ message: "Item removed and empty cart deleted" });
    }

    await cart.save();

    // Format response to include productName
    const formattedItems = cart.items.map(item => ({
      _id: item._id,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      priceAtAdd: item.priceAtAdd,
      itemType: item.itemType
    }));

    res.status(200).json({
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