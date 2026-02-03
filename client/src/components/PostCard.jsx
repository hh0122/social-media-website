import { formatDate } from "../utils/formatDate";

const PostCard = ({ post, onLike, onComment, onRepost }) => {
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
          className="flex items-center gap-2 rounded-full border border-slate-800 px-3 py-1 transition hover:border-brand-500 hover:text-white"
        >
          ❤️ {post.likes}
        </button>
        <button
          type="button"
          onClick={() => onComment?.(post.id)}
          className="flex items-center gap-2 rounded-full border border-slate-800 px-3 py-1 transition hover:border-brand-500 hover:text-white"
        >
          💬 {post.comments}
        </button>
        <button
          type="button"
          onClick={() => onRepost?.(post.id)}
          className="flex items-center gap-2 rounded-full border border-slate-800 px-3 py-1 transition hover:border-brand-500 hover:text-white"
        >
          🔁 {post.reposts}
        </button>
      </div>
    </article>
  );
};

export default PostCard;
