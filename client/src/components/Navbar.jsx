import { Link, NavLink } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { travelProfiles } from "../data/travelData";

const linkClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive ? "bg-brand-600 text-white" : "text-slate-300 hover:bg-slate-800"
  }`;

const Navbar = () => {
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return travelProfiles.filter(
      (profile) =>
        profile.name.toLowerCase().includes(term) ||
        profile.handle.toLowerCase().includes(term)
    );
  }, [query]);

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600 text-lg font-bold text-white">
            P
          </span>
          <div>
            <p className="text-lg font-semibold text-white">Pulse</p>
            <p className="text-xs text-slate-400">Connect. Share. Thrive.</p>
          </div>
        </Link>
        <div className="relative flex-1 basis-full sm:basis-auto">
          <label className="sr-only" htmlFor="profile-search">
            Search profiles
          </label>
          <input
            id="profile-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search travelers..."
            className="w-full rounded-full border border-slate-800 bg-slate-950/60 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none sm:w-72"
          />
          {results.length > 0 && (
            <div className="absolute left-0 right-0 top-12 z-10 rounded-2xl border border-slate-800 bg-slate-950/95 p-3 text-sm text-slate-200 shadow-lg sm:w-72">
              <p className="text-xs uppercase text-slate-500">Profiles</p>
              <ul className="mt-2 space-y-2">
                {results.map((profile) => (
                  <li key={profile.id}>
                    <Link
                      to={`/profile/${profile.handle.replace("@", "")}`}
                      className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-slate-900"
                      onClick={() => setQuery("")}
                    >
                      <img
                        src={profile.avatar}
                        alt={profile.name}
                        className="h-8 w-8 rounded-full border border-slate-800 object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold text-white">{profile.name}</p>
                        <p className="text-xs text-slate-500">{profile.handle}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <NavLink to="/" className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/profile" className={linkClass}>
            Profile
          </NavLink>
          {!user && (
            <NavLink to="/register" className={linkClass}>
              Sign up
            </NavLink>
          )}
          {user ? (
            <button
              className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
              onClick={logout}
            >
              Log out
            </button>
          ) : (
            <NavLink to="/login" className={linkClass}>
              Log in
            </NavLink>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
