import { useState } from "react";
import { formatDate } from "../utils/formatDate";

const PostCard = ({ post, currentUser, onLike, onComment, onRepost }) => {
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const commentCount = post.commentCount ?? post.comments?.length ?? 0;
  const isLiked = currentUser ? post.likedBy?.includes(currentUser.id) : false;

  const handleSubmitComment = (event) => {
    event.preventDefault();
    if (!commentText.trim()) return;
    onComment?.(post.id, commentText);
    setCommentText("");
    setIsCommenting(true);
  };

  return (
    <article className="glass-card flex flex-col gap-4 p-6">
      <div className="flex items-center gap-4">
        <img
          src={post.author.avatar}
          alt={post.author.name}
          className="h-12 w-12 rounded-full border border-slate-700 object-cover"
        />
        <div>
          <p className="text-sm font-semibold text-white">{post.author.name}</p>
          <p className="text-xs text-slate-400">
            {post.author.handle} · {formatDate(post.createdAt)}
          </p>
        </div>
      </div>
      <p className="text-sm text-slate-200 leading-relaxed">{post.content}</p>
      <div className="flex flex-wrap gap-4 text-xs text-slate-300">
        <button
          type="button"
          onClick={() => onLike?.(post.id)}
          aria-pressed={isLiked}
          className={`flex items-center gap-2 rounded-full border px-3 py-1 transition hover:border-brand-500 hover:text-white ${
            isLiked ? "border-brand-500 text-white" : "border-slate-800"
          }`}
        >
          ❤️ {post.likes}
        </button>
        <button
          type="button"
          onClick={() => setIsCommenting((prev) => !prev)}
          className="flex items-center gap-2 rounded-full border border-slate-800 px-3 py-1 transition hover:border-brand-500 hover:text-white"
        >
          💬 {commentCount}
        </button>
        <button
          type="button"
          onClick={() => onRepost?.(post.id)}
          className="flex items-center gap-2 rounded-full border border-slate-800 px-3 py-1 transition hover:border-brand-500 hover:text-white"
        >
          🔁 {post.reposts}
        </button>
      </div>
      {isCommenting && (
        <form onSubmit={handleSubmitComment} className="flex flex-col gap-3">
          <textarea
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            placeholder={
              currentUser ? `Reply as ${currentUser.handle}` : "Sign in to comment"
            }
            disabled={!currentUser}
            className="h-24 w-full resize-none rounded-2xl border border-slate-800 bg-slate-950/40 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{commentText.length}/240</span>
            <button
              type="submit"
              disabled={!currentUser}
              className="rounded-full bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Comment
            </button>
          </div>
        </form>
      )}
      {post.comments?.length > 0 && (
        <div className="space-y-3 border-t border-slate-800 pt-4 text-sm text-slate-300">
          {post.comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <img
                src={comment.author.avatar}
                alt={comment.author.name}
                className="h-8 w-8 rounded-full border border-slate-800 object-cover"
              />
              <div>
                <p className="text-xs text-slate-400">
                  <span className="text-slate-200">{comment.author.name}</span> ·{" "}
                  {formatDate(comment.createdAt)}
                </p>
                <p className="text-sm text-slate-100">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
};

export default PostCard;
