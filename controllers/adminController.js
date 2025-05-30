const Order = require("../models/order");

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve orders" });
  }
};

exports.getSalesReport = async (req, res) => {
  try {
    const monthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );
    const orders = await Order.find({ createdAt: { $gte: monthStart } });

    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    const avgOrderValue = totalSales / (orders.length || 1);
    const productSales = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const id = item.productId.toString();
        productSales[id] = (productSales[id] || 0) + item.quantity;
      });
    });

    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    res.json({ totalSales, avgOrderValue, topProducts });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate report" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const orderId = req.params.orderId;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ message: "Order status updated successfully", order: updatedOrder });
  } catch (err) {
    res.status(500).json({ error: "Failed to update order status", details: err.message });
  }
}