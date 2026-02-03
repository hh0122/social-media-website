import { useState } from "react";
import { formatDate } from "../utils/formatDate";

const PostCard = ({
  post,
  currentUser,
  onLike,
  onComment,
  onCommentLike,
  onReply,
  onRepost,
  onDelete,
  onSave,
  onShare,
  isSaved
}) => {
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const commentCount = post.commentCount ?? post.comments?.length ?? 0;
  const isLiked = currentUser ? post.likedBy?.includes(currentUser.id) : false;
  const allowComment = Boolean(onComment);
  const allowLike = Boolean(onLike);
  const allowRepost = Boolean(onRepost);
  const allowDelete = Boolean(onDelete && currentUser?.id === post.author.id);
  const allowSave = Boolean(onSave && currentUser);
  const allowShare = Boolean(onShare);

  const handleSubmitComment = (event) => {
    event.preventDefault();
    if (!commentText.trim()) return;
    onComment?.(post.id, commentText);
    setCommentText("");
    setIsCommenting(true);
  };

  const handleSubmitReply = (event, commentId) => {
    event.preventDefault();
    if (!replyText.trim()) return;
    onReply?.(post.id, commentId, replyText);
    setReplyText("");
    setActiveReplyId(null);
  };

  return (
    <article className="glass-card flex flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
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
        {allowDelete && (
          <button
            type="button"
            onClick={() => onDelete?.(post.id)}
            className="rounded-full border border-rose-500/40 px-3 py-1 text-xs font-semibold text-rose-200 transition hover:border-rose-400 hover:text-white"
          >
            Delete
          </button>
        )}
      </div>
      {post.photo && (
        <div className="overflow-hidden rounded-2xl border border-slate-800">
          <img
            src={post.photo}
            alt="Uploaded travel highlight"
            className="h-56 w-full object-cover sm:h-64"
          />
        </div>
      )}
      {post.destination && (
        <div className="overflow-hidden rounded-2xl border border-slate-800">
          <img
            src={post.destination.photo}
            alt={`${post.destination.name}, ${post.destination.country}`}
            className="h-56 w-full object-cover sm:h-64"
          />
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/70 px-4 py-3 text-xs text-slate-300">
            <span className="font-semibold text-white">
              {post.destination.name}, {post.destination.country}
            </span>
            <span>{post.destination.vibe}</span>
          </div>
        </div>
      )}
      <p className="text-sm text-slate-200 leading-relaxed">{post.content}</p>
      <div className="flex flex-wrap gap-4 text-xs text-slate-300">
        <button
          type="button"
          onClick={() => onLike?.(post.id)}
          aria-pressed={isLiked}
          disabled={!allowLike}
          className={`flex items-center gap-2 rounded-full border px-3 py-1 transition hover:border-brand-500 hover:text-white ${
            isLiked ? "border-brand-500 text-white" : "border-slate-800"
          } ${allowLike ? "" : "cursor-not-allowed opacity-60"}`}
        >
          ❤️ {post.likes}
        </button>
        <button
          type="button"
          onClick={() => (allowComment ? setIsCommenting((prev) => !prev) : null)}
          disabled={!allowComment}
          className={`flex items-center gap-2 rounded-full border px-3 py-1 transition hover:border-brand-500 hover:text-white ${
            allowComment ? "border-slate-800" : "border-slate-900 opacity-60"
          }`}
        >
          💬 {commentCount}
        </button>
        <button
          type="button"
          onClick={() => onRepost?.(post.id)}
          disabled={!allowRepost}
          className={`flex items-center gap-2 rounded-full border px-3 py-1 transition hover:border-brand-500 hover:text-white ${
            allowRepost ? "border-slate-800" : "border-slate-900 opacity-60"
          }`}
        >
          🔁 {post.reposts}
        </button>
        <button
          type="button"
          onClick={() => onSave?.(post.id)}
          disabled={!allowSave}
          className={`flex items-center gap-2 rounded-full border px-3 py-1 transition hover:border-brand-500 hover:text-white ${
            isSaved ? "border-brand-500 text-white" : "border-slate-800"
          } ${allowSave ? "" : "border-slate-900 opacity-60"}`}
        >
          📌 {isSaved ? "Saved" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => onShare?.(post)}
          disabled={!allowShare}
          className={`flex items-center gap-2 rounded-full border px-3 py-1 transition hover:border-brand-500 hover:text-white ${
            allowShare ? "border-slate-800" : "border-slate-900 opacity-60"
          }`}
        >
          ✈️ Share
        </button>
      </div>
      {allowComment && isCommenting && (
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
        <div className="space-y-4 border-t border-slate-800 pt-4 text-sm text-slate-300">
          {post.comments.map((comment) => {
            const commentLiked = currentUser
              ? comment.likedBy?.includes(currentUser.id)
              : false;

            return (
              <div key={comment.id} className="space-y-3">
                <div className="flex gap-3">
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.name}
                    className="h-8 w-8 rounded-full border border-slate-800 object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-xs text-slate-400">
                      <span className="text-slate-200">{comment.author.name}</span>{" "}
                      · {formatDate(comment.createdAt)}
                    </p>
                    <p className="text-sm text-slate-100">{comment.content}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                      <button
                        type="button"
                        onClick={() => onCommentLike?.(post.id, comment.id)}
                        aria-pressed={commentLiked}
                        disabled={!onCommentLike || !currentUser}
                        className={`rounded-full border px-3 py-1 transition hover:border-brand-500 hover:text-white ${
                          commentLiked ? "border-brand-500 text-white" : "border-slate-800"
                        } ${
                          onCommentLike && currentUser
                            ? ""
                            : "cursor-not-allowed opacity-60"
                        }`}
                      >
                        👍 {comment.likes ?? 0}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onReply
                            ? setActiveReplyId((prev) =>
                                prev === comment.id ? null : comment.id
                              )
                            : null
                        }
                        disabled={!onReply}
                        className={`rounded-full border px-3 py-1 transition hover:border-brand-500 hover:text-white ${
                          onReply ? "border-slate-800" : "border-slate-900 opacity-60"
                        }`}
                      >
                        💬 Reply
                      </button>
                    </div>
                    {onReply && activeReplyId === comment.id && (
                      <form
                        onSubmit={(event) => handleSubmitReply(event, comment.id)}
                        className="mt-3 flex flex-col gap-2"
                      >
                        <textarea
                          value={replyText}
                          onChange={(event) => setReplyText(event.target.value)}
                          placeholder={
                            currentUser
                              ? `Reply to ${comment.author.handle}`
                              : "Sign in to reply"
                          }
                          disabled={!currentUser}
                          className="h-20 w-full resize-none rounded-2xl border border-slate-800 bg-slate-950/40 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                        />
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>{replyText.length}/200</span>
                          <button
                            type="submit"
                            disabled={!currentUser}
                            className="rounded-full bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Reply
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
                {comment.replies?.length > 0 && (
                  <div className="space-y-3 border-l border-slate-800 pl-6">
                    {comment.replies.map((reply) => {
                      const replyLiked = currentUser
                        ? reply.likedBy?.includes(currentUser.id)
                        : false;
                      return (
                        <div key={reply.id} className="flex gap-3">
                          <img
                            src={reply.author.avatar}
                            alt={reply.author.name}
                            className="h-7 w-7 rounded-full border border-slate-800 object-cover"
                          />
                          <div className="flex-1">
                            <p className="text-xs text-slate-400">
                              <span className="text-slate-200">
                                {reply.author.name}
                              </span>{" "}
                              · {formatDate(reply.createdAt)}
                            </p>
                            <p className="text-sm text-slate-100">{reply.content}</p>
                            <div className="mt-2 text-xs text-slate-400">
                              <button
                                type="button"
                                onClick={() => onCommentLike?.(post.id, reply.id)}
                                aria-pressed={replyLiked}
                                disabled={!onCommentLike || !currentUser}
                                className={`rounded-full border px-3 py-1 transition hover:border-brand-500 hover:text-white ${
                                  replyLiked
                                    ? "border-brand-500 text-white"
                                    : "border-slate-800"
                                } ${
                                  onCommentLike && currentUser
                                    ? ""
                                    : "cursor-not-allowed opacity-60"
                                }`}
                              >
                                👍 {reply.likes ?? 0}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
};

export default PostCard;
