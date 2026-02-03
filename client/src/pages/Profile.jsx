import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="glass-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <img
            src={user.avatar}
            alt={user.name}
            className="h-24 w-24 rounded-3xl border border-slate-700 object-cover"
          />
          <div>
            <p className="text-2xl font-semibold text-white">{user.name}</p>
            <p className="text-sm text-slate-400">{user.handle}</p>
            <p className="mt-2 text-xs text-slate-500">
              Designer · Community builder · Sharing weekly inspiration on Pulse
            </p>
          </div>
        </div>
      </div>
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white">Activity snapshot</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Posts", value: 24 },
            { label: "Followers", value: 1280 },
            { label: "Following", value: 342 }
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-800 p-4">
              <p className="text-xs uppercase text-slate-500">{stat.label}</p>
              <p className="mt-2 text-xl font-semibold text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Profile;
