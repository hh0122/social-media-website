const SYSTEM_PROMPT =
  "You are an expert travel planner. Return practical day-by-day plans with attraction timing, neighborhood advice, and food suggestions.";

const categoryQueryMap = {
  attractions: "top attractions",
  food: "popular restaurants",
  cafe: "best cafes",
  nightlife: "best nightlife spots"
};

const fallbackAttractions = [
  "visit iconic landmarks and one major museum",
  "explore a local neighborhood with walking-friendly streets",
  "book a panoramic viewpoint or river experience",
  "mix one cultural site with one relaxing park stop"
];

const fallbackFood = [
  "start with a popular local bakery",
  "book a well-reviewed bistro for lunch",
  "reserve one signature dinner with local specialties",
  "finish an evening with dessert or street food"
];

const toGoogleMapsUrl = (latitude, longitude) =>
  `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

const toOpenStreetMapUrl = (latitude, longitude) =>
  `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`;


const buildLocalPlacesFallback = ({ location, category }) => {
  const query = `${location} ${categoryQueryMap[category] ?? category}`;
  return Array.from({ length: 6 }, (_, index) => {
    const label = `${location} ${category} spot ${index + 1}`;
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${query} ${index + 1}`)}`;

    return {
      id: `${location}-${category}-${index + 1}`,
      name: label,
      fullAddress: `Search result suggestion for ${location}`,
      latitude: null,
      longitude: null,
      rating: null,
      provider: "local-fallback",
      googleMapsUrl,
      openStreetMapUrl: null
    };
  });
};

const buildFallbackPlan = ({ destination, days, preferences }) => {
  const interest = preferences || "culture, food, and local experiences";

  const itinerary = Array.from({ length: days }, (_, index) => ({
    day: index + 1,
    morning: `In ${destination}, ${fallbackAttractions[index % fallbackAttractions.length]}.`,
    afternoon: `Prioritize ${interest} and keep this block flexible for weather or queues.`,
    evening: `Food idea: ${fallbackFood[index % fallbackFood.length]}.`
  }));

  return {
    source: "fallback",
    summary: `${days}-day itinerary for ${destination}`,
    tips: [
      "Pre-book major attractions and dinner slots where possible.",
      "Group places by neighborhood to reduce transit time.",
      "Keep one flexible slot each day for spontaneous stops."
    ],
    itinerary
  };
};

const sanitizePlan = (plan, fallbackPlan) => {
  if (!plan || typeof plan !== "object") return fallbackPlan;

  const itinerary = Array.isArray(plan.itinerary)
    ? plan.itinerary
        .map((item, index) => ({
          day: Number(item?.day) || index + 1,
          morning: String(item?.morning || "Explore key attractions in the city center."),
          afternoon: String(item?.afternoon || "Visit local neighborhoods and food streets."),
          evening: String(item?.evening || "Try a popular dinner spot and nearby nightlife.")
        }))
        .slice(0, fallbackPlan.itinerary.length)
    : fallbackPlan.itinerary;

  return {
    source: "openai",
    summary: String(plan.summary || fallbackPlan.summary),
    tips: Array.isArray(plan.tips) && plan.tips.length > 0
      ? plan.tips.map((tip) => String(tip))
      : fallbackPlan.tips,
    itinerary: itinerary.length > 0 ? itinerary : fallbackPlan.itinerary
  };
};

const normalizeNominatimResponse = (items = []) =>
  items.slice(0, 12).map((item) => {
    const latitude = Number(item.lat);
    const longitude = Number(item.lon);

    return {
      id: String(item.place_id),
      name: item.display_name?.split(",")?.[0] ?? "Unknown place",
      fullAddress: item.display_name,
      latitude,
      longitude,
      rating: null,
      provider: "openstreetmap",
      openStreetMapUrl: toOpenStreetMapUrl(latitude, longitude),
      googleMapsUrl: toGoogleMapsUrl(latitude, longitude)
    };
  });

const searchGooglePlaces = async ({ location, category }) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return null;
  }

  const query = `${location} ${categoryQueryMap[category] ?? category}`;

  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.googleMapsUri"
    },
    body: JSON.stringify({
      textQuery: query,
      languageCode: "en",
      maxResultCount: 12
    })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Google Places failed: ${response.status} ${message}`);
  }

  const data = await response.json();
  const items = Array.isArray(data.places) ? data.places : [];

  return items.map((item) => {
    const latitude = Number(item.location?.latitude);
    const longitude = Number(item.location?.longitude);

    return {
      id: String(item.id),
      name: item.displayName?.text ?? "Unknown place",
      fullAddress: item.formattedAddress ?? "",
      latitude,
      longitude,
      rating: Number.isFinite(item.rating) ? item.rating : null,
      provider: "google",
      googleMapsUrl: item.googleMapsUri || toGoogleMapsUrl(latitude, longitude),
      openStreetMapUrl: Number.isFinite(latitude) && Number.isFinite(longitude)
        ? toOpenStreetMapUrl(latitude, longitude)
        : null
    };
  });
};

export const generateTravelPlan = async (req, res) => {
  const { destination, days, preferences } = req.body ?? {};
  const parsedDays = Number(days);

  if (!destination?.trim() || !Number.isFinite(parsedDays) || parsedDays < 1 || parsedDays > 14) {
    return res.status(400).json({
      message: "Please provide destination and days between 1 and 14."
    });
  }

  const trimmedDestination = destination.trim();
  const fallbackPlan = buildFallbackPlan({
    destination: trimmedDestination,
    days: parsedDays,
    preferences: preferences?.trim()
  });

  if (!process.env.OPENAI_API_KEY) {
    return res.json(fallbackPlan);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.6,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content:
              `Create a ${parsedDays}-day trip for ${trimmedDestination}. Preferences: ${preferences || "general sightseeing + food"}. ` +
              "Return JSON with keys summary (string), tips (string[]), itinerary ({day,morning,afternoon,evening}[])."
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      return res.json({ ...fallbackPlan, source: "fallback" });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      return res.json(fallbackPlan);
    }

    const parsed = JSON.parse(content);
    return res.json(sanitizePlan(parsed, fallbackPlan));
  } catch {
    return res.json(fallbackPlan);
  }
};

export const searchPopularPlaces = async (req, res) => {
  const location = req.query.location?.trim();
  const category = req.query.category?.trim() || "attractions";

  if (!location) {
    return res.status(400).json({ message: "location query is required." });
  }

  try {
    const googleResults = await searchGooglePlaces({ location, category });

    if (googleResults && googleResults.length > 0) {
      return res.json({
        location,
        category,
        provider: "google",
        results: googleResults
      });
    }

    const query = `${location} ${categoryQueryMap[category] ?? category}`;
    const endpoint = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=12`;
    const response = await fetch(endpoint, {
      headers: {
        "User-Agent": "travel-social-app/1.0"
      }
    });

    if (!response.ok) {
      return res.json({
        location,
        category,
        provider: "local-fallback",
        results: buildLocalPlacesFallback({ location, category })
      });
    }

    const data = await response.json();

    return res.json({
      location,
      category,
      provider: "openstreetmap",
      results: normalizeNominatimResponse(data)
    });
  } catch {
    return res.json({
      location,
      category,
      provider: "local-fallback",
      results: buildLocalPlacesFallback({ location, category })
    });
  }
};
