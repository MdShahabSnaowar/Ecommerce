// javascript
const mongoose = require("mongoose");

// Prevent model redefinition in development with nodemon
const cachedModels = {};

module.exports = {
  FruitsVegProduct: cachedModels.FruitsVegProduct || (cachedModels.FruitsVegProduct = mongoose.model("FruitsVegProduct", require("./FruitsVegProduct").schema)),
  GroceryProduct: cachedModels.GroceryProduct || (cachedModels.GroceryProduct = mongoose.model("GroceryProduct", require("./GroceryProduct").schema)),
  LabTest: cachedModels.LabTest || (cachedModels.LabTest = mongoose.model("LabTest", require("./labtest").schema)),
  Medicine: cachedModels.Medicine || (cachedModels.Medicine = mongoose.model("Medicine", require("./medicines").schema)),
  MilkProduct: cachedModels.MilkProduct || (cachedModels.MilkProduct = mongoose.model("MilkProduct", require("./MilkProduct").schema)),
  Cart: cachedModels.Cart || (cachedModels.Cart = mongoose.model("Cart", require("./Cart").schema)),
};
