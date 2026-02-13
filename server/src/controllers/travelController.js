const SYSTEM_PROMPT =
  "You are a senior travel planning assistant. Build practical day-by-day itineraries with varied activities, neighborhood guidance, transit logic, and concrete food recommendations.";

const categoryQueryMap = {
  attractions: "top attractions",
  food: "popular restaurants",
  cafe: "best cafes",
  nightlife: "best nightlife spots"
};

const toGoogleMapsUrl = (queryOrCoords) => {
  if (typeof queryOrCoords === "string") {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryOrCoords)}`;
  }

  const { latitude, longitude } = queryOrCoords;
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
};

const toOpenStreetMapUrl = (latitude, longitude) =>
  `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`;

const buildSeedImageUrl = (seed) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/480`;

const buildLocalPlacesFallback = ({ location, category }) => {
  const query = `${location} ${categoryQueryMap[category] ?? category}`;

  return Array.from({ length: 8 }, (_, index) => {
    const number = index + 1;
    const name = `${location} ${category} spot ${number}`;

    return {
      id: `${location}-${category}-${number}`,
      name,
      fullAddress: `Popular ${category} suggestion in ${location}`,
      latitude: null,
      longitude: null,
      rating: null,
      provider: "local-fallback",
      imageUrl: buildSeedImageUrl(`${location}-${category}-${number}`),
      googleMapsUrl: toGoogleMapsUrl(`${query} ${number}`),
      openStreetMapUrl: null
    };
  });
};

const normalizeNominatimResponse = (items = [], { location, category }) =>
  items.slice(0, 12).map((item, index) => {
    const latitude = Number(item.lat);
    const longitude = Number(item.lon);
    const hasCoords = Number.isFinite(latitude) && Number.isFinite(longitude);
    const name = item.display_name?.split(",")?.[0] ?? `${location} ${category} place ${index + 1}`;

    return {
      id: String(item.place_id ?? `${location}-${category}-${index + 1}`),
      name,
      fullAddress: item.display_name ?? `Popular ${category} place in ${location}`,
      latitude: hasCoords ? latitude : null,
      longitude: hasCoords ? longitude : null,
      rating: null,
      provider: "openstreetmap",
      imageUrl: buildSeedImageUrl(`${name}-${location}`),
      openStreetMapUrl: hasCoords ? toOpenStreetMapUrl(latitude, longitude) : null,
      googleMapsUrl: hasCoords ? toGoogleMapsUrl({ latitude, longitude }) : toGoogleMapsUrl(`${name} ${location}`)
    };
  });

const searchGooglePlaces = async ({ location, category }) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  const query = `${location} ${categoryQueryMap[category] ?? category}`;
  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.googleMapsUri,places.photos"
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

  return items.map((item, index) => {
    const latitude = Number(item.location?.latitude);
    const longitude = Number(item.location?.longitude);
    const hasCoords = Number.isFinite(latitude) && Number.isFinite(longitude);

    const photoName = item.photos?.[0]?.name;
    const imageUrl = photoName
      ? `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=480&maxWidthPx=800&key=${apiKey}`
      : buildSeedImageUrl(`${item.displayName?.text ?? location}-${index + 1}`);

    return {
      id: String(item.id ?? `${location}-${category}-${index + 1}`),
      name: item.displayName?.text ?? `${location} ${category} place ${index + 1}`,
      fullAddress: item.formattedAddress ?? `Popular ${category} place in ${location}`,
      latitude: hasCoords ? latitude : null,
      longitude: hasCoords ? longitude : null,
      rating: Number.isFinite(item.rating) ? item.rating : null,
      provider: "google",
      imageUrl,
      googleMapsUrl: item.googleMapsUri || (hasCoords ? toGoogleMapsUrl({ latitude, longitude }) : toGoogleMapsUrl(query)),
      openStreetMapUrl: hasCoords ? toOpenStreetMapUrl(latitude, longitude) : null
    };
  });
};

const fetchPlacesByCategory = async ({ location, category }) => {
  try {
    const googleResults = await searchGooglePlaces({ location, category });
    if (googleResults && googleResults.length > 0) {
      return { provider: "google", results: googleResults };
    }

    const query = `${location} ${categoryQueryMap[category] ?? category}`;
    const endpoint = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=12`;
    const response = await fetch(endpoint, {
      headers: { "User-Agent": "travel-social-app/1.0" }
    });

    if (!response.ok) {
      return {
        provider: "local-fallback",
        results: buildLocalPlacesFallback({ location, category })
      };
    }

    const data = await response.json();
    const normalized = normalizeNominatimResponse(data, { location, category });

    return {
      provider: normalized.length > 0 ? "openstreetmap" : "local-fallback",
      results: normalized.length > 0 ? normalized : buildLocalPlacesFallback({ location, category })
    };
  } catch {
    return {
      provider: "local-fallback",
      results: buildLocalPlacesFallback({ location, category })
    };
  }
};

const pickByDay = (items, dayIndex) => {
  if (!items || items.length === 0) return null;
  return items[dayIndex % items.length];
};

const buildSmartFallbackPlan = async ({ destination, days, preferences }) => {
  const [attractionsData, foodData, cafeData, nightlifeData] = await Promise.all([
    fetchPlacesByCategory({ location: destination, category: "attractions" }),
    fetchPlacesByCategory({ location: destination, category: "food" }),
    fetchPlacesByCategory({ location: destination, category: "cafe" }),
    fetchPlacesByCategory({ location: destination, category: "nightlife" })
  ]);

  const attractions = attractionsData.results;
  const food = foodData.results;
  const cafes = cafeData.results;
  const nightlife = nightlifeData.results;

  const itinerary = Array.from({ length: days }, (_, index) => {
    const day = index + 1;
    const morningSpot = pickByDay(attractions, index);
    const afternoonSpot = pickByDay(cafes, index + 1);
    const dinnerSpot = pickByDay(food, index + 2);
    const eveningSpot = pickByDay(nightlife, index + 3);

    return {
      day,
      morning: morningSpot
        ? `Start at ${morningSpot.name} (${morningSpot.fullAddress}).`
        : `Explore key landmarks in ${destination}.`,
      afternoon: afternoonSpot
        ? `Recharge at ${afternoonSpot.name}, then continue with ${preferences || "local neighborhood exploration"}.`
        : `Discover local neighborhoods and focus on ${preferences || "culture + food"}.`,
      evening: dinnerSpot && eveningSpot
        ? `Dinner at ${dinnerSpot.name}, then nightlife around ${eveningSpot.name}.`
        : dinnerSpot
          ? `Dinner at ${dinnerSpot.name} and evening city walk.`
          : `Try a well-rated local dinner and enjoy a relaxed evening.`
    };
  });

  return {
    source: "smart-fallback",
    summary: `${days}-day itinerary for ${destination}`,
    tips: [
      "Group activities by area to minimize travel time.",
      "Pre-book high-demand attractions and restaurants.",
      "Use weather-aware planning: indoor options for hot/rainy blocks."
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
          morning: String(item?.morning || fallbackPlan.itinerary[index]?.morning || "Explore attractions."),
          afternoon: String(item?.afternoon || fallbackPlan.itinerary[index]?.afternoon || "Discover neighborhoods."),
          evening: String(item?.evening || fallbackPlan.itinerary[index]?.evening || "Try a local dinner and nightlife.")
        }))
        .slice(0, fallbackPlan.itinerary.length)
    : fallbackPlan.itinerary;

  return {
    source: "openai",
    summary: String(plan.summary || fallbackPlan.summary),
    tips:
      Array.isArray(plan.tips) && plan.tips.length > 0
        ? plan.tips.map((tip) => String(tip))
        : fallbackPlan.tips,
    itinerary: itinerary.length > 0 ? itinerary : fallbackPlan.itinerary
  };
};

export const generateTravelPlan = async (req, res) => {
  const { destination, days, preferences } = req.body ?? {};
  const parsedDays = Number(days);

  if (!destination?.trim() || !Number.isFinite(parsedDays) || parsedDays < 1 || parsedDays > 14) {
    return res.status(400).json({ message: "Please provide destination and days between 1 and 14." });
  }

  const trimmedDestination = destination.trim();
  const fallbackPlan = await buildSmartFallbackPlan({
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
              `Plan a ${parsedDays}-day trip for ${trimmedDestination}. Preferences: ${preferences || "general sightseeing + food"}. ` +
              "Each day must be different and include concrete places/neighborhoods and food suggestions. " +
              "Return JSON with keys summary (string), tips (string[]), itinerary ({day,morning,afternoon,evening}[])."
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      return res.json(fallbackPlan);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return res.json(fallbackPlan);

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

  const data = await fetchPlacesByCategory({ location, category });

  return res.json({
    location,
    category,
    provider: data.provider,
    results: data.results
  });
};
