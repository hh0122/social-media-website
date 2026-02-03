import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { travelProfiles } from "../data/travelData";
import PostCard from "../components/PostCard";
import { loadStoredPosts, normalizePost, saveStoredPosts } from "../utils/postStorage";
import { getAllUsers, updateStoredUser } from "../utils/userStorage";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { handle } = useParams();
  const [allPosts, setAllPosts] = useState(() => loadStoredPosts() ?? []);
  const [userDirectory, setUserDirectory] = useState(() =>
    getAllUsers(travelProfiles, user)
  );

  useEffect(() => {
    setUserDirectory(getAllUsers(travelProfiles, user));
  }, [user]);

  const normalizedHandle = useMemo(
    () => (handle ? handle.replace(/^@/, "").toLowerCase() : ""),
    [handle]
  );

  const profile = useMemo(() => {
    if (normalizedHandle) {
      return userDirectory.find(
        (traveler) =>
          traveler.handle.replace(/^@/, "").toLowerCase() === normalizedHandle
      );
    }
    return user;
  }, [normalizedHandle, user, userDirectory]);

  const isOwnProfile = Boolean(user && profile && user.id === profile.id);
  const isFollowing = useMemo(() => {
    if (!user || !profile || isOwnProfile) return false;
    return (user.followingList ?? []).includes(profile.handle);
  }, [isOwnProfile, profile, user]);

  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (!profile) return;
    setAvatarUrl(profile.avatar ?? "");
    setBio(profile.bio ?? "");
  }, [profile]);

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

  const handleToggleSave = (postId) => {
    if (!user) return;
    const savedPosts = user.savedPosts ?? [];
    const updatedSaved = savedPosts.includes(postId)
      ? savedPosts.filter((id) => id !== postId)
      : [...savedPosts, postId];
    const updatedUser = { ...user, savedPosts: updatedSaved };
    updateStoredUser(updatedUser);
    updateUser(updatedUser);
    refreshDirectory(updatedUser);
  };

  const refreshDirectory = (currentUser) => {
    setUserDirectory(getAllUsers(travelProfiles, currentUser ?? user));
  };

  const handleProfileSave = (event) => {
    event.preventDefault();
    if (!isOwnProfile || !user) return;
    const updatedUser = {
      ...user,
      avatar: avatarUrl.trim() || user.avatar,
      bio: bio.trim()
    };
    updateStoredUser(updatedUser);
    updateUser(updatedUser);
    refreshDirectory(updatedUser);
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleToggleFollow = () => {
    if (!user || !profile || isOwnProfile) return;
    const currentFollowing = user.followingList ?? [];
    const nextFollowing = isFollowing
      ? currentFollowing.filter((entry) => entry !== profile.handle)
      : [...currentFollowing, profile.handle];
    const updatedUser = {
      ...user,
      followingList: nextFollowing,
      following: nextFollowing.length
    };
    const updatedProfile = {
      ...profile,
      followers: Math.max(0, (profile.followers ?? 0) + (isFollowing ? -1 : 1))
    };
    updateStoredUser(updatedUser);
    updateStoredUser(updatedProfile);
    updateUser(updatedUser);
    refreshDirectory(updatedUser);
  };

  const followedProfiles = useMemo(() => {
    if (!isOwnProfile || !user) return [];
    const followingHandles = user.followingList ?? [];
    if (followingHandles.length === 0) return [];
    return userDirectory.filter((entry) => followingHandles.includes(entry.handle));
  }, [isOwnProfile, user, userDirectory]);

  const savedPosts = useMemo(() => {
    if (!isOwnProfile || !user) return [];
    const savedIds = user.savedPosts ?? [];
    if (savedIds.length === 0) return [];
    return allPosts.map(normalizePost).filter((post) => savedIds.includes(post.id));
  }, [allPosts, isOwnProfile, user]);

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
          {!isOwnProfile && user ? (
            <div className="sm:ml-auto">
              <button
                type="button"
                onClick={handleToggleFollow}
                className={`rounded-full px-5 py-2 text-xs font-semibold transition ${
                  isFollowing
                    ? "border border-slate-600 text-slate-200 hover:border-slate-400"
                    : "bg-brand-600 text-white hover:bg-brand-500"
                }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
      {isOwnProfile ? (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white">Edit profile</h2>
          <p className="mt-1 text-sm text-slate-400">
            Update your avatar and bio to personalize your space.
          </p>
          <form onSubmit={handleProfileSave} className="mt-4 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                Avatar URL
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(event) => setAvatarUrl(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/40 px-4 py-3 text-sm text-slate-100"
                placeholder="https://..."
              />
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <label className="rounded-full border border-slate-700 px-4 py-2 font-semibold text-slate-200 transition hover:border-slate-500">
                  Upload photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
                <span>Choose a photo from your library to set as your avatar.</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                rows={3}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/40 px-4 py-3 text-sm text-slate-100"
                placeholder="Tell the community about your travel vibe."
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-brand-600 px-5 py-2 text-xs font-semibold text-white transition hover:bg-brand-500"
            >
              Save changes
            </button>
          </form>
        </div>
      ) : null}
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
              onSave={handleToggleSave}
              isSaved={Boolean(user?.savedPosts?.includes(post.id))}
            />
          ))
        ) : (
          <div className="glass-card p-6 text-center text-sm text-slate-400">
            No travel posts yet. Encourage {profile.name.split(" ")[0]} to share a
            new adventure!
          </div>
        )}
      </div>
      {isOwnProfile ? (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white">Saved posts</h2>
          <p className="mt-1 text-sm text-slate-400">
            Keep your favorite highlights here for quick inspiration.
          </p>
          {savedPosts.length > 0 ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {savedPosts.map((post) => (
                <div
                  key={post.id}
                  className="overflow-hidden rounded-2xl border border-slate-800"
                >
                  <img
                    src={post.photo ?? post.destination?.photo}
                    alt="Saved highlight"
                    className="h-32 w-full object-cover"
                  />
                  <div className="p-3 text-sm text-slate-300">
                    <p className="text-xs text-slate-500">{post.author.handle}</p>
                    <p className="mt-1 truncate text-sm text-slate-100">
                      {post.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-800 p-4 text-sm text-slate-400">
              Tap the save button on any post to build your inspiration board.
            </div>
          )}
        </div>
      ) : null}
      {isOwnProfile ? (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white">Following</h2>
          <p className="mt-1 text-sm text-slate-400">
            You are currently following {followedProfiles.length} creators.
          </p>
          {followedProfiles.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {followedProfiles.map((followed) => (
                <div
                  key={followed.id ?? followed.handle}
                  className="flex items-center gap-3 rounded-2xl border border-slate-800 p-3"
                >
                  <img
                    src={followed.avatar}
                    alt={followed.name}
                    className="h-10 w-10 rounded-2xl border border-slate-700 object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">{followed.name}</p>
                    <p className="text-xs text-slate-500">{followed.handle}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-800 p-4 text-sm text-slate-400">
              Follow other travelers to keep their adventures close by.
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
};

export default Profile;
