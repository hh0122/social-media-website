const STORAGE_KEY = "pulse-posts";

export const createId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const normalizeComment = (comment) => ({
  ...comment,
  likedBy: Array.isArray(comment.likedBy) ? comment.likedBy : [],
  likes: Number.isInteger(comment.likes) ? comment.likes : 0,
  replies: Array.isArray(comment.replies)
    ? comment.replies.map(normalizeComment)
    : []
});

export const normalizePost = (post) => {
  const commentCount = Number.isInteger(post.commentCount)
    ? post.commentCount
    : Array.isArray(post.comments)
      ? post.comments.length
      : 0;

  return {
    ...post,
    likedBy: Array.isArray(post.likedBy) ? post.likedBy : [],
    comments: Array.isArray(post.comments)
      ? post.comments.map(normalizeComment)
      : [],
    commentCount
  };
};

export const loadStoredPosts = () => {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return null;
    return parsed.map(normalizePost);
  } catch (error) {
    console.error("Failed to load stored posts", error);
    return null;
  }
};

export const saveStoredPosts = (posts) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
};
