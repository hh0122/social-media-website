import { useState } from "react";

const CreatePost = ({ onCreate }) => {
  const [content, setContent] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!content.trim()) return;
    onCreate(content.trim());
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6">
      <h2 className="text-lg font-semibold text-white">Share a travel moment</h2>
      <p className="mt-1 text-sm text-slate-400">
        Tell fellow travelers where you are and what made the stop unforgettable.
      </p>
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Describe the destination highlight..."
        className="mt-4 h-28 w-full resize-none rounded-2xl border border-slate-700 bg-slate-950/40 p-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
      />
      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <span>{content.length}/240</span>
        <button
          type="submit"
          className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-500"
        >
          Post
        </button>
      </div>
    </form>
  );
};

export default CreatePost;
