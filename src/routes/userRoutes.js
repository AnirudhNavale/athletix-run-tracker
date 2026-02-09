const express = require("express");
const router = express.Router();
const User = require("../model/user");
const bcrypt=require("bcryptjs")

// @route   POST /api/users/register
// @desc    Register a user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    const salt= await bcrypt.genSalt(10)
    const hashedPassword= await bcrypt.hash(password,salt)

    const user = await User.create({
      name,
      email,
      password:hashedPassword,
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
