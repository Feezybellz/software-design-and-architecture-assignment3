const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    status: {
      type: String,
      default: "Pending",
      enum: [
        "Pending",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
        "Failed",
      ],
      required: true,
    },
    trackingNumber: {
      type: String,
    },
    estimatedDeliveryDate: {
      type: Date,
    },
    actualDeliveryDate: {
      type: Date,
    },
    carrier: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Delivery", deliverySchema);
