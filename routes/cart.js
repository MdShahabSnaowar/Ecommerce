const express = require("express");
const router = express.Router();
const { Cart, FruitsVegProduct, GroceryProduct, LabTest, Medicine, MilkProduct } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");

async function findProductInAllModels(productId) {
  try {
    const models = [
      { model: FruitsVegProduct, itemType: "FruitsVegProduct" },
      { model: GroceryProduct, itemType: "GroceryProduct" },
      { model: LabTest, itemType: "LabTest" },
      { model: Medicine, itemType: "Medicine" },
      { model: MilkProduct, itemType: "MilkProduct" },
    ];

    for (const { model, itemType } of models) {
      const product = await model.findById(productId);
      if (product) {
        console.log(`Found product ${productId} in ${itemType}:`, product);
        return { product, itemType };
      }
    }
    console.log(`Product ${productId} not found in any model`);
    return null;
  } catch (err) {
    console.error("Error finding product:", err);
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
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const items = Array.isArray(req.body) ? req.body : [req.body];
    console.log("Received items:", items);

    // Find or create the user's cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({
        userId,
        items: [],
        totalPrice: 0,
      });
      console.log("Created new cart for user:", userId);
    }

    for (const { productId, quantity } of items) {
      if (!productId || !quantity || quantity < 1) {
        console.log(`Skipping invalid item: productId=${productId}, quantity=${quantity}`);
        continue; // Skip invalid items
      }

      const result = await findProductInAllModels(productId);
      if (!result) {
        console.log(`Product not found: ${productId}`);
        continue; // Skip if product not found
      }

      const { product, itemType } = result;
      const priceAtAdd = product.price * quantity;
      console.log(`Adding item: productId=${productId}, itemType=${itemType}, quantity=${quantity}, priceAtAdd=${priceAtAdd}`);

      const existingIndex = cart.items.findIndex(
        (item) =>
          item.productId.toString() === productId.toString() &&
          item.itemType === itemType
      );

      if (existingIndex > -1) {
        // Update existing item
        cart.items[existingIndex].quantity += quantity;
        cart.items[existingIndex].priceAtAdd += priceAtAdd;
        console.log(`Updated existing item: productId=${productId}, new quantity=${cart.items[existingIndex].quantity}`);
      } else {
        // Add new item
        cart.items.push({
          productId,
          quantity,
          priceAtAdd,
          itemType,
        });
        console.log(`Added new item: productId=${productId}, quantity=${quantity}`);
      }
    }

    // Calculate totalPrice for the cart
    cart.totalPrice = cart.items.reduce((total, item) => total + item.priceAtAdd, 0);
    cart.updatedAt = Date.now();

    console.log("Saving cart:", cart);
    await cart.save();

    res.status(200).json({
      message: "Items added to cart",
      data: cart,
    });
  } catch (err) {
    console.error("Cart Add Error:", err);
    res.status(500).json({ message: "Error adding items", error: err.message });
  }
});

// 🛒 Get user cart
router.get("/", authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate("items.productId");
    if (!cart) {
      return res.status(404).json({ message: "No cart found for user" });
    }
    res.status(200).json({ message: "Cart fetched", data: cart });
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ message: "Error fetching cart", error: err.message });
  }
});

// 🗑️ Remove item from cart
router.post("/remove", authMiddleware, async (req, res) => {
  try {
    const { productId, itemType } = req.body;
    const userId = req.user.id;

    if (!productId || !itemType) {
      return res.status(400).json({ message: "productId and itemType are required" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId || item.itemType !== itemType
    );

    if (cart.items.length === initialLength) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Recalculate totalPrice
    cart.totalPrice = cart.items.reduce((total, item) => total + item.priceAtAdd, 0);
    cart.updatedAt = Date.now();

    if (cart.items.length === 0) {
      // Optionally delete cart if empty
      await Cart.deleteOne({ _id: cart._id });
      return res.status(200).json({ message: "Item removed and empty cart deleted" });
    }

    await cart.save();
    res.status(200).json({ message: "Item removed from cart", data: cart });
  } catch (err) {
    console.error("Error removing item:", err);
    res.status(500).json({ message: "Error removing item", error: err.message });
  }
});

module.exports = router;