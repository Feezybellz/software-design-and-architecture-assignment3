const Order = require("../models/order");
const { getCartItems, getCartTotalPrice, clearCart } = require("../utils/cartUtils");
const Delivery = require('../models/delivery');
const Product = require("../models/product");
const { reduceStock } = require("./productController");

exports.createOrder = async (req, res) => {
  const {
    billingName,
    billingEmailAddress,
    billingPhone,
    billingAddress,
    billingCity,
    zipCode,
    billingCountry
  } = req.body;

  try {
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

    const items = await getCartItems(req.user._id);
    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty. Cannot place order." });
    }

    // First, verify stock availability and reduce stock
    for (const item of items) {
      try {
        await reduceStock(item.item._id, item.quantity);
      } catch (error) {
        return res.status(400).json({ 
          error: "Stock update failed", 
          details: `Insufficient stock for product: ${item.item.name}` 
        });
      }
    }

    cartItems = items.map(item => ({
      name: item.item.name,
      image_url: item.item.image_url || "",
      price: item.item.price,
      sku: item.item.sku,
      quantity: item.quantity || 1,
    }));

    const total = await getCartTotalPrice(items);

    const order = new Order({
      customerId: req.user._id,
      items: cartItems,
      total,
      shippingInfo: shippingInfoData,
      paymentDetails: paymentDetailsData,
    });

    await order.save();

    const newDelivery = new Delivery({
      orderId: order._id,
      status: 'Pending',
    });
    await newDelivery.save();

    const clearCartStatus = await clearCart(req.user._id);

    if(clearCartStatus.success) {
      res.status(201).json({ success: true, message: "Order placed successfully", order });
    }else{
      res.status(500).json({ error: "Failed to clear cart after order placement", details: clearCartStatus.message });
    }

  } catch (err) {
    console.error("Error during order or delivery creation:", err);
    res
      .status(400)
      .json({ error: "Failed to place order", details: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const userId = req.user.id;

    const orders = await Order.find({ customerId: userId });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders", details: err.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);

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
