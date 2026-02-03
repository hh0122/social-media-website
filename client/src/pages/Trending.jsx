import { useMemo, useState } from "react";
import { travelDestinations } from "../data/travelData";
import { useAuth } from "../context/AuthContext";
import { createId } from "../utils/postStorage";
import { loadReviews, saveReviews } from "../utils/reviewStorage";

const pickTrendingDestinations = () => {
  const shuffled = [...travelDestinations].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 4);
};

const Trending = () => {
  const { user } = useAuth();
  const [destinations, setDestinations] = useState(() => pickTrendingDestinations());
  const [reviews, setReviews] = useState(() => loadReviews());
  const [drafts, setDrafts] = useState({});

  const reviewsByDestination = useMemo(() => {
    return reviews.reduce((acc, review) => {
      if (!acc[review.destinationId]) acc[review.destinationId] = [];
      acc[review.destinationId].push(review);
      return acc;
    }, {});
  }, [reviews]);

  const handleShuffle = () => {
    setDestinations(pickTrendingDestinations());
  };

  const handleDraftChange = (destinationId, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [destinationId]: {
        rating: prev[destinationId]?.rating ?? 5,
        message: prev[destinationId]?.message ?? "",
        [field]: value
      }
    }));
  };

  const handleSubmitReview = (destinationId) => {
    const draft = drafts[destinationId];
    if (!draft?.message?.trim()) return;
    const nextReview = {
      id: createId(),
      destinationId,
      authorId: user?.id ?? "guest",
      authorName: user?.name ?? "Guest",
      authorHandle: user?.handle ?? "@guest",
      rating: Number(draft.rating ?? 5),
      message: draft.message.trim(),
      createdAt: new Date().toISOString()
    };
    const next = [nextReview, ...reviews];
    setReviews(next);
    saveReviews(next);
    setDrafts((prev) => ({
      ...prev,
      [destinationId]: {
        rating: prev[destinationId]?.rating ?? 5,
        message: ""
      }
    }));
  };

  return (
    <section className="flex flex-col gap-8">
      <div className="glass-card flex flex-col gap-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-brand-200">Trending tab</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Discover what’s hot</h1>
            <p className="mt-2 text-sm text-slate-400">
              Shuffle fresh destinations and drop quick reviews for other travelers.
            </p>
          </div>
          <button
            type="button"
            onClick={handleShuffle}
            className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500"
          >
            Shuffle destinations
          </button>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {destinations.map((destination) => {
          const destinationReviews = reviewsByDestination[destination.id] ?? [];
          const draft = drafts[destination.id] ?? { rating: 5, message: "" };

          return (
            <div key={destination.id} className="glass-card flex flex-col gap-4 p-6">
              <div className="overflow-hidden rounded-2xl border border-slate-800">
                <img
                  src={destination.photo}
                  alt={`${destination.name}, ${destination.country}`}
                  className="h-44 w-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {destination.name}, {destination.country}
                </h2>
                <p className="text-sm text-slate-400">{destination.vibe}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 p-4">
                <p className="text-xs uppercase text-slate-500">Leave a review</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-300">
                  <label className="flex items-center gap-2">
                    Rating
                    <select
                      value={draft.rating}
                      onChange={(event) =>
                        handleDraftChange(destination.id, "rating", event.target.value)
                      }
                      className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1 text-xs text-slate-100"
                    >
                      {[5, 4, 3, 2, 1].map((value) => (
                        <option key={value} value={value}>
                          {value}★
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <textarea
                  value={draft.message}
                  onChange={(event) =>
                    handleDraftChange(destination.id, "message", event.target.value)
                  }
                  placeholder={
                    user ? `Review as ${user.handle}` : "Share your thoughts..."
                  }
                  className="mt-3 h-20 w-full resize-none rounded-2xl border border-slate-800 bg-slate-950/40 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
                />
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>{draft.message.length}/200</span>
                  <button
                    type="button"
                    onClick={() => handleSubmitReview(destination.id)}
                    className="rounded-full bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-500"
                  >
                    Post review
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-xs uppercase text-slate-500">
                  Recent reviews ({destinationReviews.length})
                </p>
                {destinationReviews.length > 0 ? (
                  destinationReviews.slice(0, 3).map((review) => (
                    <div
                      key={review.id}
                      className="rounded-2xl border border-slate-800 p-3 text-sm text-slate-300"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="text-slate-200">{review.authorName}</span>
                        <span>{review.rating}★</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-100">{review.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">
                    No reviews yet. Be the first to share a tip!
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Trending;
