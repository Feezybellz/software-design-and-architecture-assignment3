// app.js

const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");

// Load environment variables
dotenv.config();

// Import routes
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");
// const adminRoutes = require("./routes/adminRoutes");
const { adminRoutes, adminViewRoutes } = require("./routes/adminRoutes");
const cartRoutes = require("./routes/cartRoutes");
const { authenticate } = require("./middleware/authMiddleware");

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// app.use(express.static(path.join(__dirname, "uploads")));
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

async function main() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  // .then(() => console.log("✅ MongoDB connected"))
  // .catch((err) => console.error("❌ MongoDB connection error:", err));

  // auto seed data into to user collection

  const seedAdmin = async () => {
    const User = require("./models/user");
    const bcrypt = require("bcrypt");

    try {
      // Check if users already exist
      const email = "admin@admin.com";
      const password = "admin123";
      const passwordHash = await bcrypt.hash(password, 10);

      const existingUsers = await User.find({ email });
      if (existingUsers.length > 0) {
        console.log("Admin user already exists. Skipping seed.");
        return;
      }

      const admin = new User({
        name: "Admin User",
        email: email,
        passwordHash, // Use the hashed password here
        role: "admin",
      });

      await admin.save();
      console.log("Admin user seeded successfully.");
    } catch (error) {
      console.error("Error seeding users:", error);
    }
  };

  await seedAdmin();

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
  app.get("/products", (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
  });
  // app.get("/admin", (req, res) => {
  //   res.sendFile(__dirname + "/views/admin.html");
  // });

  app.get("/cart", authenticate, (req, res) => {
    res.sendFile(__dirname + "/views/cart.html");
  });

  app.get("/orders", authenticate, (req, res) => {
    res.sendFile(__dirname + "/views/order.html");
  });

  app.get("/orders/:orderId", authenticate, (req, res) => {
    res.sendFile(__dirname + "/views/view-order.html");
  });

  app.get("/checkout", authenticate, (req, res) => {
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

main();
// Database connection
