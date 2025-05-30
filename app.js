// app.js

const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path"); 
const cookieParser = require('cookie-parser');

// Load environment variables
dotenv.config();

// Import routes
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");
// const adminRoutes = require("./routes/adminRoutes");
const { adminRoutes, adminViewRoutes } = require("./routes/adminRoutes");
const cartRoutes = require("./routes/cartRoutes");

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// Database connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/admin", adminViewRoutes);
// app.use("/admin", adminRoutes);

// Home route
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});
// app.get("/admin", (req, res) => {
//   res.sendFile(__dirname + "/views/admin.html");
// });

app.get("/cart", (req, res) => {
  res.sendFile(__dirname + "/views/cart.html");
});

app.get("/orders", (req, res) => {
  res.sendFile(__dirname + "/views/order.html");
})

app.get("/orders/:orderId", (req, res) => {
  res.sendFile(__dirname + "/views/view-order.html");
})

app.get("/checkout", (req, res) => {
  res.sendFile(__dirname + "/views/checkout.html");
});

app.get("/register", (req, res) => {
  res.sendFile(__dirname + "/views/register.html");
});
app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/views/login.html");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
