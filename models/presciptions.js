const mongoose = require("mongoose");

const presciptions = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  images: [{
    type: String, // File path or URL
    required: true
  }],
  description: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("presciptions", presciptions);
