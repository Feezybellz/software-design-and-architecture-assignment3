const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const role = req.body.role || "user"; // Default to 'user' if not provided

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ error: "Email already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, passwordHash, role });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: "Lax",
      path: "/",
    });
    res.json({ message: "Login successful", token, role: user.role });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout successful" });
};

exports.forgotPassword = async (req, res) => {
  res
    .status(201)
    .json({ message: "Forgot password functionality not implemented yet" });
};

exports.checkLoginStatus = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.json({ isLoggedIn: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id || decoded._id);

    if (!user) {
      return res.json({ isLoggedIn: false });
    }

    res.json({
      isLoggedIn: true,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.json({ isLoggedIn: false });
  }
};
