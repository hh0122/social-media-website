import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    content: { type: String, required: true, maxlength: 240 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    reposts: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
