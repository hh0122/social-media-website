import User from "../models/User.js";

export const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
};

export const searchUsers = async (req, res) => {
  const term = req.query.q?.trim();
  if (!term) {
    return res.json([]);
  }

  const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escapedTerm, "i");

  const query = {
    $or: [{ name: regex }, { handle: regex }]
  };

  if (req.user?.id) {
    query._id = { $ne: req.user.id };
  }

  const users = await User.find(query).select("-password").limit(10);

  return res.json(users);
};
