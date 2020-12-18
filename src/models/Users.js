const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    select: false,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["USER", "TECH", "ADMIN"],
    default: "USER",
  },
  occupied: {
    type: Boolean,
  },
  repair: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Repair",
  },
});

module.exports = mongoose.model("User", UserSchema);
