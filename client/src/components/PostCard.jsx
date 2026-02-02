import { formatDate } from "../utils/formatDate";

const PostCard = ({ post }) => {
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
      <div className="flex flex-wrap gap-4 text-xs text-slate-400">
        <span>❤️ {post.likes} likes</span>
        <span>💬 {post.comments} comments</span>
        <span>🔁 {post.reposts} reposts</span>
      </div>
    </article>
  );
};

export default PostCard;
