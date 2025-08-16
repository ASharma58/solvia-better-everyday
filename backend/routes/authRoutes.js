// backend/routes/auth.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashed,
      status: "active", // ensure explicit default
    });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/login  (single route, with status check)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Block non-active accounts
    if (user.status !== "active") {
      return res
        .status(403)
        .json({ error: `Account ${user.status}. Please contact support.` });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    user.last_login = new Date();
    await user.save();

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        last_login: user.last_login,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// helper: ensure account is active for sensitive actions
async function requireActive(req, res, next) {
  try {
    const userId = req.body.userId || req.params.userId || req.params.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const user = await User.findById(userId).select("status");
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    if (user.status !== "active") {
      return res.status(403).json({ error: `Account ${user.status}.` });
    }
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

// POST /api/auth/change-password
router.post("/change-password", requireActive, async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;
  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ error: "Missing fields" });
  }
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed" });
  } catch (e) {
    console.error("change-password error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/delete-account
router.post("/delete-account", requireActive, async (req, res) => {
  const { userId, password } = req.body;
  if (!userId || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: "Password is incorrect" });

    await User.findByIdAndDelete(userId);
    // TODO: cascade delete of related documents if needed
    res.json({ message: "Account deleted" });
  } catch (e) {
    console.error("delete-account error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
