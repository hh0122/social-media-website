import Post from "../models/Post.js";

export const createPost = async (req, res) => {
  const { content } = req.body;
  const post = await Post.create({
    content,
    author: req.user.id
  });

  res.status(201).json(post);
};

export const getPosts = async (_req, res) => {
  const posts = await Post.find()
    .populate("author", "name handle")
    .sort({ createdAt: -1 });
  res.json(posts);
};
