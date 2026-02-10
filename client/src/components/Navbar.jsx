import { Link, NavLink } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { travelProfiles } from "../data/travelData";
import { getAllUsers } from "../utils/userStorage";

const linkClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive ? "bg-brand-600 text-white" : "text-slate-300 hover:bg-slate-800"
  }`;

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [remoteResults, setRemoteResults] = useState([]);

  const allUsers = useMemo(() => getAllUsers(travelProfiles, user), [user]);

  const localResults = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return allUsers.filter(
      (profile) =>
        profile.name.toLowerCase().includes(term) ||
        profile.handle.toLowerCase().includes(term)
    );
  }, [allUsers, query]);

  useEffect(() => {
    const term = query.trim();
    if (!term) {
      setRemoteResults([]);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await api.get("/users/search", {
          params: { q: term }
        });
        setRemoteResults(Array.isArray(response.data) ? response.data : []);
      } catch {
        setRemoteResults([]);
      }
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  const results = remoteResults.length > 0 ? remoteResults : localResults;

  return (
    <header className="relative z-30 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600 text-lg font-bold text-white">
            HH
          </span>
          <div>
            <p className="text-lg font-semibold text-white">Travel</p>
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
            <div className="absolute left-0 right-0 top-12 z-40 rounded-2xl border border-slate-800 bg-slate-950/95 p-3 text-sm text-slate-200 shadow-lg sm:w-72">
              <p className="text-xs uppercase text-slate-500">Profiles</p>
              <ul className="mt-2 space-y-2">
                {results.map((profile) => (
                  <li key={profile.id ?? profile._id ?? profile.handle}>
                    <Link
                      to={`/profile/${profile.handle.replace("@", "")}`}
                      className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-slate-900"
                      onClick={() => setQuery("")}
                    >
                      {profile.avatar ? (
                        <img
                          src={profile.avatar}
                          alt={profile.name}
                          className="h-8 w-8 rounded-full border border-slate-800 object-cover"
                        />
                      ) : (
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-xs font-semibold uppercase text-slate-300">
                          {profile.name?.charAt(0) ?? "U"}
                        </span>
                      )}
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
          <NavLink to="/trending" className={linkClass}>
            Trending
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
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
          >
            {theme === "light" ? "Night mode" : "Light mode"}
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
