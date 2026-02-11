const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// @route   POST /api/users/register
// @desc    Register user
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check existing user
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Generate token
    // const token = jwt.sign(
    //   { id: user._id },
    //   process.env.JWT_SECRET,
    //   { expiresIn: "1h" }
    // );

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
    
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
// @route   POST /api/users/login
// @desc    Login user
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/profile",protect, async (req, res) => {
  res.json(req.user);
});


module.exports = router;
