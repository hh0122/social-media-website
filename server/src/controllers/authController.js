import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";

export const registerUser = async (req, res) => {
  const { name, email, password, handle } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, handle });

  res.status(201).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      handle: user.handle
    },
    token: generateToken(user._id)
  });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

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
      handle: user.handle
    },
    token: generateToken(user._id)
  });
};
