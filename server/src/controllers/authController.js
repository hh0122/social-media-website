import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, handle } = req.body;

    if (!name || !email || !password || !handle) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const existingHandle = await User.findOne({ handle });
    if (existingHandle) {
      return res.status(400).json({ message: "Handle already in use" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, handle });

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        handle: user.handle,
        followers: user.followers,
        following: user.following
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error("Failed to register user", error);
    res.status(500).json({ message: "Unable to register user" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        handle: user.handle,
        followers: user.followers,
        following: user.following
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error("Failed to login user", error);
    res.status(500).json({ message: "Unable to login" });
  }
};
