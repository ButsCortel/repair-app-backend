const mongoose = require("mongoose");
require("mongoose-currency").loadType(mongoose);
const currency = mongoose.Types.Currency;

const RepairSchema = new mongoose.Schema(
  {
    dateCreated: {
      type: Date,
    },
    lastUpdate: {
      type: Date,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    device: {
      type: String,
      required: true,
    },
    issue: {
      type: String,
      required: true,
    },
    expedite: {
      type: Boolean,
      default: false,
    },
    price: {
      type: currency,
      default: "0",
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
      ],
      default: "INCOMING",
    },
    image: {
      type: String,
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
  }
);

RepairSchema.virtual("image_url").get(function () {
  return process.env.BUCKET_URL + this.image + "?authuser=1";
});

module.exports = mongoose.model("Repair", RepairSchema);
