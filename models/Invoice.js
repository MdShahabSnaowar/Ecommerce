const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  // Sets the default date to the current timestamp when a new invoice is created
  date: {
    type: Date,
    default: Date.now,
  },
  // References the 'Customer' model, assuming you have one.
  // This stores the ObjectId of the associated customer.
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer", // Make sure 'Customer' matches your customer model's name
    required: true, // customer_id should typically be required for an invoice
  },
  address: String,
  particular: String,
  per_unit: String,
  qty: String,
  price: String,
  tot_amt: String,
  inv_notes: String,
  bill_rem: Number,
  cust_rem: Number,
});

export const Invoice = mongoose.model("Invoice", invoiceSchema);
