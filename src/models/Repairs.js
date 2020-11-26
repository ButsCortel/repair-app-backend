const mongoose = require("mongoose");
require("mongoose-currency").loadType(mongoose);
const currency = mongoose.Types.Currency;


const RepairSchema = new mongoose.Schema({
    dateCreated: {
        type: Date,
        default: Date.now,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    customer: {
        type: String,
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
    price: {
        type: currency,
        default: "0",
    },
    status: {
        type: String,
        enum: ["INCOMING", "ONGOING", "ON HOLD", "OUTGOING"],
        default: "INCOMING",
    },
    image: {
        type: String,
    }
}, {
    toJSON: {
        virtuals: true
    }
});

RepairSchema.virtual("image_url").get(function () {
    return process.env.BUCKET_URL + this.image + "?authuser=1"
})

module.exports = mongoose.model("Repair", RepairSchema);