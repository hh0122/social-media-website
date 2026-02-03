import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { travelProfiles } from "../data/travelData";
import PostCard from "../components/PostCard";
import { loadStoredPosts, normalizePost, saveStoredPosts } from "../utils/postStorage";
import { getAllUsers } from "../utils/userStorage";

const Profile = () => {
  const { user } = useAuth();
  const { handle } = useParams();
  const [allPosts, setAllPosts] = useState(() => loadStoredPosts() ?? []);

  const allUsers = useMemo(() => getAllUsers(travelProfiles, user), [user]);

  const profile = useMemo(() => {
    if (handle) {
      return allUsers.find(
        (traveler) => traveler.handle.toLowerCase() === `@${handle}`.toLowerCase()
      );
    }
    return user;
  }, [allUsers, handle, user]);

  useEffect(() => {
    saveStoredPosts(allPosts);
  }, [allPosts]);

  const posts = useMemo(() => {
    if (!profile) return [];
    return allPosts.map(normalizePost).filter((post) => post.author.id === profile.id);
  }, [allPosts, profile]);

  const handleDeletePost = (postId) => {
    if (!user) return;
    setAllPosts((prev) =>
      prev.filter((post) => !(post.id === postId && post.author.id === user.id))
    );
  };

  if (!profile) {
    return (
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 text-slate-300">
        <div className="glass-card p-6 text-center">
          <p className="text-lg font-semibold text-white">Traveler not found</p>
          <p className="mt-2 text-sm text-slate-400">
            Try searching for another explorer in the search bar.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="glass-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="h-24 w-24 rounded-3xl border border-slate-700 object-cover"
          />
          <div>
            <p className="text-2xl font-semibold text-white">{profile.name}</p>
            <p className="text-sm text-slate-400">{profile.handle}</p>
            <p className="mt-2 text-xs text-slate-500">
              {profile.bio ?? "Travel storyteller sharing weekly inspiration on Pulse."}
            </p>
          </div>
        </div>
      </div>
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white">Activity snapshot</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Posts", value: posts.length },
            { label: "Followers", value: profile.followers ?? 0 },
            { label: "Following", value: profile.following ?? 0 }
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-800 p-4">
              <p className="text-xs uppercase text-slate-500">{stat.label}</p>
              <p className="mt-2 text-xl font-semibold text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={user}
              onDelete={handleDeletePost}
            />
          ))
        ) : (
          <div className="glass-card p-6 text-center text-sm text-slate-400">
            No travel posts yet. Encourage {profile.name.split(" ")[0]} to share a
            new adventure!
          </div>
        )}
      </div>
    </section>
  );
};

export default Profile;
