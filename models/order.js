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
        name: { type: String, required: true },
        price: { type: Number, required: true },
        image_url: { type: String, default: "" },
        sku: { type: String, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    status: { type: String, default: "Pending" },
    total: { type: Number, required: true },
    shippingInfo: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentDetails: {
      method: String,
      status: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
