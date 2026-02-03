import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    login({
      id: "u2",
      name: "Taylor Reed",
      handle: "@taylor",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&w=200&h=200"
    });
    navigate("/profile");
  };

  return (
    <section className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <div className="glass-card p-6">
        <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-400">
          Sign in to keep the conversation flowing.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/40 px-4 py-3 text-sm text-slate-100"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/40 px-4 py-3 text-sm text-slate-100"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-500"
          >
            Log in
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-slate-400">
          New here?{" "}
          <Link to="/register" className="font-semibold text-brand-200 hover:text-white">
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Login;
