// const mongoose = require("mongoose");

// const cartItemSchema = new mongoose.Schema(
//   {
//     itemType: {
//       type: String,
//       enum: ["Product", "Medicine", "LabTest", "HealthCheckup", "FruitsVegProduct"],
//       required: true,
//     },
//     productId: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true,
//       refPath: "items.itemType",
//     },
//     quantity: {
//       type: Number,
//       required: true,
//       default: 1,
//     },
//     priceAtAdd: {
//       type: Number,
//       required: true,
//     },
//   },
//   { _id: false }
// );

// const cartSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     items: [cartItemSchema],
//     totalPrice: {
//       type: Number,
//       default: 0,
//     },
//     updatedAt: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   { timestamps: true }
// );

// // Auto-calculate total price before save
// cartSchema.pre("save", function (next) {
//   this.totalPrice = this.items.reduce((sum, item) => sum + item.priceAtAdd, 0);
//   next();
// });

// module.exports = mongoose.model("Cart", cartSchema);

const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        priceAtAdd: {
          type: Number,
          required: true,
        },
        itemType: {
          type: String,
          required: true,
          enum: ["FruitsVegProduct", "GroceryProduct", "LabTest", "Medicine", "MilkProduct"],
        },
      },
    ],
    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);

