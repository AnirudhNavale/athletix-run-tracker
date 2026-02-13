const mongoose = require("mongoose");

const runSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  distance: {
    type: Number, // in KM
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  pace: {
    type: Number // calculated (min/km)
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model("run", runSchema);
