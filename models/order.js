const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, required: true },
      },
    ],
    status: { type: String, default: "Pending" },
    total: { type: Number, required: true },
    shippingInfo: {
      address: String,
      city: String,
      postalCode: String,
      country: String,
    },
    paymentDetails: {
      method: String,
      status: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
