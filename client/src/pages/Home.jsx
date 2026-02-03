import { useMemo, useState } from "react";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";
import { useAuth } from "../context/AuthContext";

const demoPosts = [
  {
    id: "p1",
    author: {
      name: "Jordan Lane",
      handle: "@jordanlane",
      avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=facearea&w=200&h=200"
    },
    content: "Morning check-in: launched our new community challenge. Can't wait to see the creativity!",
    createdAt: "2024-07-15T09:24:00Z",
    likes: 132,
    comments: 24,
    reposts: 8
  },
  {
    id: "p2",
    author: {
      name: "Maya Ortiz",
      handle: "@mayaortiz",
      avatar: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=facearea&w=200&h=200"
    },
    content: "Just wrapped a fireside chat with our design team. The new onboarding flow is dreamy.",
    createdAt: "2024-07-14T18:40:00Z",
    likes: 98,
    comments: 17,
    reposts: 5
  }
];

const Home = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState(demoPosts);

  const feedHeader = useMemo(
    () =>
      user
        ? `Welcome back, ${user.name.split(" ")[0]}!`
        : "Welcome to Pulse — your social hub.",
    [user]
  );

  const handleCreate = (content) => {
    if (!user) return;
    const newPost = {
      id: `p${posts.length + 1}`,
      author: user,
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
      reposts: 0
    };
    setPosts((prev) => [newPost, ...prev]);
  };

  const updatePostMetric = (postId, metric) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, [metric]: post[metric] + 1 } : post
      )
    );
  };

  return (
    <section className="flex flex-col gap-8">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-card p-6">
          <p className="text-sm text-brand-200">Live feed</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{feedHeader}</h1>
          <p className="mt-3 text-sm text-slate-400">
            Stay in sync with your crew, swap quick moments, and discover what the community is
            celebrating right now.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-300">
            <span className="rounded-full border border-slate-700 px-3 py-1">#daily-wins</span>
            <span className="rounded-full border border-slate-700 px-3 py-1">#creative-work</span>
            <span className="rounded-full border border-slate-700 px-3 py-1">#product-updates</span>
          </div>
        </div>
        <div className="glass-card flex flex-col gap-4 p-6">
          <h2 className="text-lg font-semibold text-white">Community pulse</h2>
          <div className="space-y-3 text-sm text-slate-300">
            <div>
              <p className="text-xs uppercase text-slate-500">Trending topic</p>
              <p className="mt-1 text-base text-white">#RemoteRituals</p>
              <p className="text-xs text-slate-400">2.4k posts in the last 24h</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">Top creators</p>
              <ul className="mt-2 space-y-2">
                <li className="flex items-center justify-between">
                  <span>Studio Ace</span>
                  <span className="text-xs text-brand-200">+320</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Nova Labs</span>
                  <span className="text-xs text-brand-200">+210</span>
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
            onLike={(postId) => updatePostMetric(postId, "likes")}
            onComment={(postId) => updatePostMetric(postId, "comments")}
            onRepost={(postId) => updatePostMetric(postId, "reposts")}
          />
        ))}
      </div>
    </section>
  );
};

export default Home;
