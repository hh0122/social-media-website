import { useEffect, useMemo, useState } from "react";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";
import { useAuth } from "../context/AuthContext";
import { travelDestinations, travelProfiles } from "../data/travelData";
import {
  createId,
  loadStoredPosts,
  normalizePost,
  saveStoredPosts
} from "../utils/postStorage";

const demoPosts = [
  {
    id: "p1",
    author: travelProfiles[2],
    content:
      "Sunrise over the bamboo forest was unreal. Sharing my favorite quiet temple walk from today.",
    createdAt: "2024-07-15T09:24:00Z",
    likes: 132,
    comments: [
      {
        id: "c1",
        author: travelProfiles[3],
        content: "Adding this to my Kyoto itinerary! 🌸",
        createdAt: "2024-07-15T10:10:00Z",
        likes: 4,
        likedBy: ["u4"],
        replies: [
          {
            id: "c1-r1",
            author: travelProfiles[2],
            content: "Do it! Go early for the quiet paths.",
            createdAt: "2024-07-15T10:35:00Z",
            likes: 2,
            likedBy: ["u3"]
          }
        ]
      }
    ],
    reposts: 8,
    destination: travelDestinations[0]
  },
  {
    id: "p2",
    author: travelProfiles[1],
    content:
      "Found the dreamiest cliffside café. Sunset + sea breeze = instant reset.",
    createdAt: "2024-07-14T18:40:00Z",
    likes: 98,
    comments: [
      {
        id: "c2",
        author: travelProfiles[0],
        content: "That glow is everything. Did you stay in Oia?",
        createdAt: "2024-07-14T19:05:00Z",
        likes: 1,
        likedBy: ["u1"],
        replies: []
      }
    ],
    reposts: 5,
    destination: travelDestinations[1]
  },
  {
    id: "p3",
    author: travelProfiles[3],
    content:
      "Trading city lights for lake days. Banff’s reflections are surreal.",
    createdAt: "2024-07-13T12:15:00Z",
    likes: 76,
    comments: [],
    reposts: 3,
    destination: travelDestinations[2]
  }
];

const Home = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState(() => loadStoredPosts() ?? demoPosts.map(normalizePost));

  const feedHeader = useMemo(
    () =>
      user
        ? `Welcome back, ${user.name.split(" ")[0]}!`
        : "Welcome to Pulse — your social hub.",
    [user]
  );

  useEffect(() => {
    saveStoredPosts(posts);
  }, [posts]);

  const handleCreate = ({ content, photo }) => {
    if (!user) return;
    const destination =
      travelDestinations[Math.floor(Math.random() * travelDestinations.length)];
    const newPost = {
      id: createId(),
      author: user,
      content,
      photo,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: [],
      commentCount: 0,
      likedBy: [],
      reposts: 0,
      destination
    };
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleToggleLike = (postId) => {
    if (!user) return;
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? (() => {
              const alreadyLiked = post.likedBy.includes(user.id);
              const likedBy = alreadyLiked
                ? post.likedBy.filter((id) => id !== user.id)
                : [...post.likedBy, user.id];
              const likes = Math.max(0, post.likes + (alreadyLiked ? -1 : 1));
              return { ...post, likedBy, likes };
            })()
          : post
      )
    );
  };

  const handleAddComment = (postId, message) => {
    if (!user) return;
    const content = message.trim();
    if (!content) return;
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [
                {
                  id: createId(),
                  author: user,
                  content,
                  createdAt: new Date().toISOString(),
                  likes: 0,
                  likedBy: [],
                  replies: []
                },
                ...post.comments
              ],
              commentCount: (post.commentCount ?? 0) + 1
            }
          : post
      )
    );
  };

  const handleToggleCommentLike = (postId, commentId) => {
    if (!user) return;
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments.map((comment) => {
                if (comment.id === commentId) {
                  const alreadyLiked = comment.likedBy.includes(user.id);
                  const likedBy = alreadyLiked
                    ? comment.likedBy.filter((id) => id !== user.id)
                    : [...comment.likedBy, user.id];
                  const likes = Math.max(0, comment.likes + (alreadyLiked ? -1 : 1));
                  return { ...comment, likedBy, likes };
                }

                const replyMatch = comment.replies?.some((reply) => reply.id === commentId);
                if (!replyMatch) return comment;

                return {
                  ...comment,
                  replies: comment.replies.map((reply) => {
                    if (reply.id !== commentId) return reply;
                    const alreadyLiked = reply.likedBy.includes(user.id);
                    const likedBy = alreadyLiked
                      ? reply.likedBy.filter((id) => id !== user.id)
                      : [...reply.likedBy, user.id];
                    const likes = Math.max(0, reply.likes + (alreadyLiked ? -1 : 1));
                    return { ...reply, likedBy, likes };
                  })
                };
              })
            }
          : post
      )
    );
  };

  const handleAddReply = (postId, commentId, message) => {
    if (!user) return;
    const content = message.trim();
    if (!content) return;
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments.map((comment) =>
                comment.id === commentId
                  ? {
                      ...comment,
                      replies: [
                        {
                          id: createId(),
                          author: user,
                          content,
                          createdAt: new Date().toISOString(),
                          likes: 0,
                          likedBy: [],
                          replies: []
                        },
                        ...(comment.replies ?? [])
                      ]
                    }
                  : comment
              )
            }
          : post
      )
    );
  };

  const handleRepost = (postId) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, reposts: post.reposts + 1 } : post
      )
    );
  };

  return (
    <section className="flex flex-col gap-8">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-card p-6">
          <p className="text-sm text-brand-200">Travel feed</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{feedHeader}</h1>
          <p className="mt-3 text-sm text-slate-400">
            Share destination highlights, map out new adventures, and explore the world through
            your travel community.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-300">
            <span className="rounded-full border border-slate-700 px-3 py-1">#sunset-chasers</span>
            <span className="rounded-full border border-slate-700 px-3 py-1">#city-breaks</span>
            <span className="rounded-full border border-slate-700 px-3 py-1">#mountain-moments</span>
          </div>
        </div>
        <div className="glass-card flex flex-col gap-4 p-6">
          <h2 className="text-lg font-semibold text-white">Travel buzz</h2>
          <div className="space-y-3 text-sm text-slate-300">
            <div>
              <p className="text-xs uppercase text-slate-500">Trending destination</p>
              <p className="mt-1 text-base text-white">#SantoriniSunsets</p>
              <p className="text-xs text-slate-400">1.8k posts in the last 24h</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">Top travelers</p>
              <ul className="mt-2 space-y-2">
                <li className="flex items-center justify-between">
                  <span>Isabella Cruz</span>
                  <span className="text-xs text-brand-200">+210</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Ravi Patel</span>
                  <span className="text-xs text-brand-200">+180</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <CreatePost onCreate={handleCreate} />
      <div className="grid gap-6">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUser={user}
            onLike={handleToggleLike}
            onComment={handleAddComment}
            onCommentLike={handleToggleCommentLike}
            onReply={handleAddReply}
            onRepost={handleRepost}
          />
        ))}
      </div>
    </section>
  );
};

export default Home;
