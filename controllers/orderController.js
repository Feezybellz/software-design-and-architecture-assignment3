const Order = require("../models/order");

exports.createOrder = async (req, res) => {
  const { customerId, items, total, shippingInfo, paymentDetails } = req.body;
  try {
    const order = new Order({
      customerId,
      items,
      total,
      shippingInfo,
      paymentDetails,
    });
    await order.save();
    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    res
      .status(400)
      .json({ error: "Failed to place order", details: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("items.productId");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};
