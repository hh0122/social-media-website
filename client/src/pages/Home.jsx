import { useEffect, useMemo, useState } from "react";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";
import StoriesBar from "../components/StoriesBar";
import { useAuth } from "../context/AuthContext";
import { travelDestinations, travelProfiles } from "../data/travelData";
import {
  createId,
  loadStoredPosts,
  normalizePost,
  saveStoredPosts
} from "../utils/postStorage";
import { updateStoredUser } from "../utils/userStorage";

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
  const { user, updateUser } = useAuth();
  const [posts, setPosts] = useState(() => loadStoredPosts() ?? demoPosts.map(normalizePost));
  const [shareNotice, setShareNotice] = useState("");

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

  useEffect(() => {
    if (!shareNotice) return;
    const timeout = setTimeout(() => setShareNotice(""), 3000);
    return () => clearTimeout(timeout);
  }, [shareNotice]);

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

  const handleToggleSave = (postId) => {
    if (!user) return;
    const savedPosts = user.savedPosts ?? [];
    const updatedSaved = savedPosts.includes(postId)
      ? savedPosts.filter((id) => id !== postId)
      : [...savedPosts, postId];
    const updatedUser = { ...user, savedPosts: updatedSaved };
    updateStoredUser(updatedUser);
    updateUser(updatedUser);
  };

  const handleSharePost = async (post) => {
    const shareText = `${post.author.name} on Pulse: ${post.content}`;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
        setShareNotice("Link copied! Share it in your messages.");
        return;
      }
    } catch (error) {
      console.warn("Clipboard unavailable", error);
    }
    setShareNotice("Copy this highlight manually from the post.");
  };

  const storyItems = useMemo(() => {
    return travelProfiles.map((profile, index) => {
      const destination = travelDestinations[index % travelDestinations.length];
      return {
        id: `story-${profile.id}`,
        name: profile.name,
        handle: profile.handle,
        avatar: profile.avatar,
        storyPhoto: destination.photo,
        caption: destination.vibe
      };
    });
  }, []);

  const handleDeletePost = (postId) => {
    if (!user) return;
    setPosts((prev) =>
      prev.filter((post) => !(post.id === postId && post.author.id === user.id))
    );
  };

  return (
    <section className="flex flex-col gap-8">
      {shareNotice ? (
        <div className="rounded-2xl border border-brand-500/40 bg-brand-500/10 px-4 py-3 text-sm text-brand-100">
          {shareNotice}
        </div>
      ) : null}
      <StoriesBar currentUser={user} stories={storyItems} />
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
            <div>
              <p className="text-xs uppercase text-slate-500">Suggested for you</p>
              <ul className="mt-2 space-y-2">
                {travelProfiles.slice(0, 2).map((profile) => (
                  <li key={profile.id} className="flex items-center justify-between">
                    <span>{profile.name}</span>
                    <span className="text-xs text-slate-400">{profile.handle}</span>
                  </li>
                ))}
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
            onDelete={handleDeletePost}
            onSave={handleToggleSave}
            onShare={handleSharePost}
            isSaved={Boolean(user?.savedPosts?.includes(post.id))}
          />
        ))}
      </div>
    </section>
  );
};

export default Home;
