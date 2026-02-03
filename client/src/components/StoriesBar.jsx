import { useEffect, useMemo, useState } from "react";
import { loadSeenStories, saveSeenStories } from "../utils/storyStorage";

const StoriesBar = ({ currentUser, stories }) => {
  const [seenStories, setSeenStories] = useState(() => loadSeenStories());
  const [activeStory, setActiveStory] = useState(null);

  useEffect(() => {
    saveSeenStories(seenStories);
  }, [seenStories]);

  const storyItems = useMemo(() => {
    const unique = new Map();
    stories.forEach((story) => {
      unique.set(story.id, story);
    });
    return Array.from(unique.values());
  }, [stories]);

  const handleOpenStory = (story) => {
    setActiveStory(story);
    setSeenStories((prev) => (prev.includes(story.id) ? prev : [...prev, story.id]));
  };

  const hasSeen = (storyId) => seenStories.includes(storyId);

  return (
    <section className="glass-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-brand-200">Stories</p>
          <h2 className="text-lg font-semibold text-white">Today’s highlights</h2>
        </div>
        {currentUser ? (
          <button
            type="button"
            className="rounded-full border border-slate-700 px-4 py-1 text-xs font-semibold text-slate-200 transition hover:border-brand-500 hover:text-white"
          >
            + Add story
          </button>
        ) : null}
      </div>
      <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
        {storyItems.map((story) => (
          <button
            key={story.id}
            type="button"
            onClick={() => handleOpenStory(story)}
            className="flex min-w-[5.5rem] flex-col items-center gap-2 text-xs text-slate-300"
          >
            <span
              className={`rounded-full p-0.5 ${
                hasSeen(story.id)
                  ? "bg-slate-700/60"
                  : "bg-gradient-to-tr from-pink-500 via-amber-400 to-purple-500"
              }`}
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-950">
                <img
                  src={story.avatar}
                  alt={story.name}
                  className="h-14 w-14 rounded-full object-cover"
                />
              </span>
            </span>
            <span className="truncate">{story.handle}</span>
          </button>
        ))}
      </div>
      {activeStory ? (
        <div className="relative mt-6 overflow-hidden rounded-3xl border border-slate-800">
          <img
            src={activeStory.storyPhoto}
            alt={`${activeStory.name} story`}
            className="h-64 w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
          <div className="absolute bottom-4 left-4 flex items-center gap-3">
            <img
              src={activeStory.avatar}
              alt={activeStory.name}
              className="h-10 w-10 rounded-full border border-white/40 object-cover"
            />
            <div>
              <p className="text-sm font-semibold text-white">{activeStory.name}</p>
              <p className="text-xs text-slate-200">{activeStory.caption}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveStory(null)}
            className="absolute right-4 top-4 rounded-full border border-white/30 px-3 py-1 text-xs font-semibold text-white backdrop-blur transition hover:border-white"
          >
            Close
          </button>
        </div>
      ) : null}
    </section>
  );
};

export default StoriesBar;
