import { useMemo, useState } from "react";
import api from "../api/axios";

const categories = ["attractions", "food", "cafe", "nightlife"];

const createFallbackPlanMessage = ({ destination, days, preferences }) => {
  const tripDays = Number(days) || 1;
  const prefText = preferences?.trim() || "sightseeing and local food";

  const lines = [`${tripDays}-day itinerary for ${destination}`, "", "• Keep major bookings reserved early.", "• Group visits by neighborhood to reduce transit.", "• Leave room for spontaneous discoveries.", ""];

  for (let day = 1; day <= tripDays; day += 1) {
    lines.push(
      `Day ${day}`,
      `Morning: Explore signature landmarks in ${destination}.`,
      `Afternoon: Focus on ${prefText} in a walkable district.`,
      "Evening: Choose a well-rated local restaurant and nearby dessert spot.",
      ""
    );
  }

  return lines.join("\n").trim();
};

const formatPlanMessage = (plan) => {
  const lines = [plan.summary || "Your travel plan", "", ...(plan.tips ?? []).map((tip) => `• ${tip}`), ""];
  (plan.itinerary ?? []).forEach((item) => {
    lines.push(
      `Day ${item.day}`,
      `Morning: ${item.morning}`,
      `Afternoon: ${item.afternoon}`,
      `Evening: ${item.evening}`,
      ""
    );
  });

  return lines.join("\n").trim();
};

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
  const [placesProvider, setPlacesProvider] = useState("-");
  const [placesError, setPlacesError] = useState("");
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);

  const canPlan = destination.trim().length > 1 && Number(days) >= 1 && Number(days) <= 14;

  const addAssistantMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        text
      }
    ]);
  };

  const planTrip = async () => {
    if (!canPlan || isPlanning) return;

    const userMessage = `I'm going to ${destination} for ${days} days. Preferences: ${preferences || "general"}.`;
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", text: userMessage }]);
    setIsPlanning(true);

    try {
      const response = await api.post("/travel/plan", {
        destination: destination.trim(),
        days: Number(days),
        preferences
      });

      const plan = response.data;
      if (!plan?.summary && !Array.isArray(plan?.itinerary)) {
        throw new Error(plan?.message || "Planner service returned an invalid response.");
      }

      addAssistantMessage(formatPlanMessage(plan));
    } catch (error) {
      const apiMessage = error?.response?.data?.message;
      const fallbackText = createFallbackPlanMessage({ destination, days, preferences });
      addAssistantMessage(
        `${apiMessage || "Live planner is temporarily unavailable."}\n\nI generated a local backup plan so you can still continue:\n\n${fallbackText}`
      );
    } finally {
      setIsPlanning(false);
    }
  };

  const searchPlaces = async () => {
    if (!location.trim() || isLoadingPlaces) return;
    setIsLoadingPlaces(true);
    setPlacesError("");

    try {
      const response = await api.get("/travel/places", {
        params: {
          location,
          category
        }
      });
      setPlaces(response.data.results ?? []);
      setPlacesProvider(response.data.provider ?? "unknown");
    } catch (error) {
      setPlaces([]);
      setPlacesProvider("-");
      setPlacesError(error?.response?.data?.message || "Could not load places right now.");
    } finally {
      setIsLoadingPlaces(false);
    }
  };

  const mapEmptyText = useMemo(() => {
    if (isLoadingPlaces) return "Finding popular places...";
    if (placesError) return placesError;
    return "Search a city to get map-ready popular places.";
  }, [isLoadingPlaces, placesError]);

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
              className={`whitespace-pre-line rounded-2xl px-4 py-3 text-sm ${
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
          Search attractions, food, cafes, or nightlife and open results in Google Maps.
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

        <div className="flex items-center justify-between">
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
          <span className="text-xs uppercase text-slate-500">Source: {placesProvider}</span>
        </div>

        {places.length === 0 ? (
          <p className="rounded-xl border border-slate-800 bg-slate-950/30 p-4 text-sm text-slate-400">
            {mapEmptyText}
          </p>
        ) : (
          <ul className="space-y-3">
            {places.map((place) => (
              <li key={place.id} className="rounded-xl border border-slate-800 bg-slate-950/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-white">{place.name}</p>
                  {place.rating ? <span className="text-xs text-amber-300">{place.rating}★</span> : null}
                </div>
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
                  {place.openStreetMapUrl ? (
                    <a
                      href={place.openStreetMapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-slate-700 px-3 py-1 font-semibold text-slate-200"
                    >
                      Open in OSM
                    </a>
                  ) : null}
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
