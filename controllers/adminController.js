const Order = require("../models/order");
const Product = require("../models/product");

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("items.productId");
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
