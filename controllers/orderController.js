const Order = require("../models/order");
const Delivery = require('../models/delivery');

exports.createOrder = async (req, res) => {
  const {
    billingName,
    billingEmailAddress,
    billingPhone,
    billingAddress,
    billingCity,
    zipCode, // Assuming 'zipCode' is sent from client for postalCode
    billingCountry,
    items, // Assuming client sends array of { productId, quantity }
    total, // Assuming client sends calculated total
  } = req.body;

  try {
    // Ensure user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "User not authenticated. Cannot place order." });
    }

    const shippingInfoData = {
      name: billingName,
      email: billingEmailAddress,
      phone: billingPhone,
      address: billingAddress,
      city: billingCity,
      postalCode: zipCode,
      country: billingCountry,
    };

    const paymentDetailsData = {
      method: "Cash on Delivery",
      status: "Pending", // Or "Unpaid"
    };

    const order = new Order({
      customerId: req.user._id, // Use authenticated user's ID
      items,
      total, // Consider recalculating/validating this on backend in a real app
      shippingInfo: shippingInfoData,
      paymentDetails: paymentDetailsData,
      // status will default to 'Pending' as per schema
    });

    await order.save();

    // Create associated Delivery document
    const newDelivery = new Delivery({
      orderId: order._id,
      status: 'Pending', // Default status for new delivery
    });
    await newDelivery.save();

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    console.error("Error during order or delivery creation:", err);
    res
      .status(400)
      .json({ error: "Failed to place order", details: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    // Ensure user is authenticated and req.user.id is available
    if (!req.user || !req.user.id) { // Or req.user._id depending on your auth setup
      return res.status(401).json({ error: "User not authenticated" });
    }
    const userId = req.user.id; // Or req.user._id

    const orders = await Order.find({ customerId: userId })
                              .populate("items.productId", "name price image_url sku");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders", details: err.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId)
                              .populate('items.productId', 'name price image_url sku')
                              .populate('customerId', 'firstName lastName email');

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (err) {
    if (err.name === 'CastError') {
        return res.status(400).json({ error: "Invalid order ID format", details: err.message });
    }
    res.status(500).json({ error: "Failed to fetch order", details: err.message });
  }
};
