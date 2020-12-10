const mongoose = require("mongoose");

const HistorySchema = new mongoose.Schema({
  date: {
    type: Date,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  repair: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Repair",
    required: true,
  },
  note: {
    type: String,
    default: "N/A",
  },
  status: {
    type: String,
    enum: [
      "INCOMING",
      "RECEIVED",
      "ONGOING",
      "ON HOLD",
      "OUTGOING",
      "COMPLETED",
      "CANCELLED",
    ],
    default: "INCOMING",
  },
  prevStatus: {
    type: String,
    enum: [
      "INCOMING",
      "RECEIVED",
      "ONGOING",
      "ON HOLD",
      "OUTGOING",
      "COMPLETED",
      "CANCELLED",
    ],
    default: "INCOMING",
  },
});

module.exports = mongoose.model("History", HistorySchema);
