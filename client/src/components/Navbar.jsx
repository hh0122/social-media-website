import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive ? "bg-brand-600 text-white" : "text-slate-300 hover:bg-slate-800"
  }`;

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600 text-lg font-bold text-white">
            P
          </span>
          <div>
            <p className="text-lg font-semibold text-white">Pulse</p>
            <p className="text-xs text-slate-400">Connect. Share. Thrive.</p>
          </div>
        </Link>
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
