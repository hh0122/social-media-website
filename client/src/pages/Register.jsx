import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    login({
      id: "u3",
      name: name || "New Creator",
      handle: handle || "@newcreator",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&w=200&h=200"
    });
    navigate("/profile");
  };

  return (
    <section className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <div className="glass-card p-6">
        <h1 className="text-2xl font-semibold text-white">Join Pulse</h1>
        <p className="mt-2 text-sm text-slate-400">
          Build your profile and start sharing with the community.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
          <button
            type="submit"
            className="w-full rounded-full bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-500"
          >
            Create account
          </button>
        </form>
      </div>
    </section>
  );
};

export default Register;
