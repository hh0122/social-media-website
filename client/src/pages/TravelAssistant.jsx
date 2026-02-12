import { useMemo, useState } from "react";
import api from "../api/axios";

const categories = ["attractions", "food", "cafe", "nightlife"];

const TravelAssistant = () => {
  const [destination, setDestination] = useState("Paris");
  const [days, setDays] = useState(4);
  const [preferences, setPreferences] = useState("museums, cafes, local food");
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi! Tell me your trip and I can generate a daily plan with food ideas."
    }
  ]);
  const [isPlanning, setIsPlanning] = useState(false);

  const [location, setLocation] = useState("Paris");
  const [category, setCategory] = useState("attractions");
  const [places, setPlaces] = useState([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);

  const canPlan = destination.trim().length > 1 && Number(days) >= 1;

  const planTrip = async () => {
    if (!canPlan || isPlanning) return;
    const userMessage = `I'm going to ${destination} for ${days} days. Preferences: ${preferences || "general"}.`;
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", text: userMessage }
    ]);
    setIsPlanning(true);

    try {
      const response = await api.post("/travel/plan", {
        destination,
        days: Number(days),
        preferences
      });

      const plan = response.data;
      const lines = [plan.summary, "", ...(plan.tips ?? []).map((tip) => `• ${tip}`), ""];
      (plan.itinerary ?? []).forEach((item) => {
        lines.push(
          `Day ${item.day}`,
          `Morning: ${item.morning}`,
          `Afternoon: ${item.afternoon}`,
          `Evening: ${item.evening}`,
          ""
        );
      });

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: lines.join("\n").trim()
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: "I couldn't create a plan right now. Please try again in a moment."
        }
      ]);
    } finally {
      setIsPlanning(false);
    }
  };

  const searchPlaces = async () => {
    if (!location.trim() || isLoadingPlaces) return;
    setIsLoadingPlaces(true);

    try {
      const response = await api.get("/travel/places", {
        params: {
          location,
          category
        }
      });
      setPlaces(response.data.results ?? []);
    } catch {
      setPlaces([]);
    } finally {
      setIsLoadingPlaces(false);
    }
  };

  const mapEmptyText = useMemo(() => {
    if (isLoadingPlaces) return "Finding popular places...";
    return "Search a city to get map-ready popular places.";
  }, [isLoadingPlaces]);

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <div className="glass-card flex flex-col gap-4 p-6">
        <h1 className="text-2xl font-semibold text-white">AI Travel Chatbox</h1>
        <p className="text-sm text-slate-400">
          Enter a destination and trip length to get daily place and food suggestions.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-slate-400">
            Destination
            <input
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2 text-sm text-slate-100"
            />
          </label>
          <label className="text-xs text-slate-400">
            Days
            <input
              type="number"
              min={1}
              max={14}
              value={days}
              onChange={(event) => setDays(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2 text-sm text-slate-100"
            />
          </label>
        </div>
        <label className="text-xs text-slate-400">
          Preferences
          <input
            value={preferences}
            onChange={(event) => setPreferences(event.target.value)}
            placeholder="art, nature, shopping, vegetarian food..."
            className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2 text-sm text-slate-100"
          />
        </label>
        <button
          type="button"
          onClick={planTrip}
          disabled={!canPlan || isPlanning}
          className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPlanning ? "Planning..." : "Generate Travel Plan"}
        </button>

        <div className="max-h-[420px] space-y-3 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-2xl px-4 py-3 text-sm whitespace-pre-line ${
                message.role === "user"
                  ? "ml-6 bg-brand-600/20 text-brand-100"
                  : "mr-6 bg-slate-900 text-slate-100"
              }`}
            >
              {message.text}
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card flex flex-col gap-4 p-6">
        <h2 className="text-2xl font-semibold text-white">Popular Places API Finder</h2>
        <p className="text-sm text-slate-400">
          Search any location and open results in Google Maps or OpenStreetMap.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="City or area"
            className="w-full rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2 text-sm text-slate-100"
          />
          <button
            type="button"
            onClick={searchPlaces}
            className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500"
          >
            {isLoadingPlaces ? "Searching..." : "Search"}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setCategory(value)}
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                category === value
                  ? "bg-brand-600 text-white"
                  : "border border-slate-700 text-slate-300"
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        {places.length === 0 ? (
          <p className="rounded-xl border border-slate-800 bg-slate-950/30 p-4 text-sm text-slate-400">
            {mapEmptyText}
          </p>
        ) : (
          <ul className="space-y-3">
            {places.map((place) => (
              <li key={place.id} className="rounded-xl border border-slate-800 bg-slate-950/30 p-4">
                <p className="font-semibold text-white">{place.name}</p>
                <p className="mt-1 text-xs text-slate-400">{place.fullAddress}</p>
                <div className="mt-3 flex gap-2 text-xs">
                  <a
                    href={place.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-brand-600 px-3 py-1 font-semibold text-white"
                  >
                    Open in Google Maps
                  </a>
                  <a
                    href={place.openStreetMapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-slate-700 px-3 py-1 font-semibold text-slate-200"
                  >
                    Open in OSM
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default TravelAssistant;
