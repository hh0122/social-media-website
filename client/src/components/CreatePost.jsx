import { useState } from "react";

const CreatePost = ({ onCreate }) => {
  const [content, setContent] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoName, setPhotoName] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!content.trim()) return;
    onCreate({ content: content.trim(), photo });
    setContent("");
    setPhoto(null);
    setPhotoName("");
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setPhoto(null);
      setPhotoName("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result);
      setPhotoName(file.name);
    };
    reader.readAsDataURL(file);
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
      <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-dashed border-slate-700 bg-slate-950/30 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <span>Add a photo from your library</span>
          <label className="cursor-pointer rounded-full border border-slate-700 px-4 py-1 text-xs font-semibold text-slate-200 transition hover:border-brand-500 hover:text-white">
            Upload
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </label>
        </div>
        {photo ? (
          <div className="space-y-3">
            <div className="overflow-hidden rounded-2xl border border-slate-800">
              <img src={photo} alt={photoName || "Selected upload"} className="h-48 w-full object-cover" />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="truncate">{photoName || "Photo selected"}</span>
              <button
                type="button"
                onClick={() => {
                  setPhoto(null);
                  setPhotoName("");
                }}
                className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-brand-500 hover:text-white"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500">PNG or JPG up to 10MB.</p>
        )}
      </div>
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
