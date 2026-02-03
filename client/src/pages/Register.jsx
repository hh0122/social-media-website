import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      const response = await api.post("/auth/register", {
        name,
        handle,
        email,
        password
      });
      login({ user: response.data.user, token: response.data.token });
      navigate("/profile");
    } catch (error) {
      const message =
        error?.response?.data?.message ?? "Unable to create your account.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <div className="glass-card p-6">
        <h1 className="text-2xl font-semibold text-white">Join Pulse</h1>
        <p className="mt-2 text-sm text-slate-400">
          Build your profile and start sharing with the community.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {errorMessage ? (
            <p className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-xs text-rose-100">
              {errorMessage}
            </p>
          ) : null}
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">Name</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/40 px-4 py-3 text-sm text-slate-100"
              placeholder="Samira Patel"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/40 px-4 py-3 text-sm text-slate-100"
              placeholder="samira@example.com"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">Handle</label>
            <input
              type="text"
              value={handle}
              onChange={(event) => setHandle(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/40 px-4 py-3 text-sm text-slate-100"
              placeholder="@samirap"
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
              placeholder="Create a password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create account"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Register;
