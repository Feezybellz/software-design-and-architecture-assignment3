const Order = require("../models/order");

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve orders" });
  }
};

exports.getOrderStatistics = async (req, res) => {
  try {
    // Get total orders and revenue
    const allOrders = await Order.find();
    const totalOrders = allOrders.length;
    const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0);

    // Get orders by status
    const pendingOrders = await Order.countDocuments({ status: "Pending" });
    const cancelledOrders = await Order.countDocuments({ status: "Cancelled" });
    const deliveredOrders = await Order.countDocuments({ status: "Delivered" });

    // Get recent orders (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentOrders = await Order.find({
      createdAt: { $gte: sevenDaysAgo }
    }).sort({ createdAt: -1 }).limit(5);

    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    res.json({
      totalOrders,
      totalRevenue,
      pendingOrders,
      cancelledOrders,
      deliveredOrders,
      averageOrderValue,
      recentOrders
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate statistics", details: err.message });
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
  let { status } = req.body;

  status = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(); // Capitalize first letter
  const validStatuses = ["Pending", "Processing", "Delivered", "Cancelled"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status provided" });
  }

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