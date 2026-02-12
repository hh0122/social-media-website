const SYSTEM_PROMPT =
  "You are a concise travel planner. Return practical day-by-day plans with food tips and neighborhoods.";

const fallbackAttractions = [
  "Visit the historic city center and landmark museums",
  "Take a walking tour through the most popular neighborhoods",
  "Book a sunset viewpoint or river cruise",
  "Leave time for a local market and cultural performance"
];

const fallbackFood = [
  "Start with a famous local bakery in the morning",
  "Try a highly rated neighborhood bistro for lunch",
  "Reserve one signature dinner experience",
  "End one evening with street food or late-night desserts"
];

const buildFallbackPlan = ({ destination, days, preferences }) => {
  const itinerary = Array.from({ length: days }, (_, index) => ({
    day: index + 1,
    morning: `Explore ${destination} highlights and ${fallbackAttractions[index % fallbackAttractions.length].toLowerCase()}.`,
    afternoon: `Focus on ${preferences || "local culture"} and relax in a walkable district.`,
    evening: `Dinner suggestion: ${fallbackFood[index % fallbackFood.length]}.`
  }));

  return {
    source: "fallback",
    summary: `${days}-day itinerary for ${destination}`,
    tips: [
      "Use public transport passes for cheaper daily movement.",
      "Book major attractions 1-2 weeks early.",
      "Save offline maps before leaving your hotel."
    ],
    itinerary
  };
};

const normalizeNominatimResponse = (items = []) =>
  items.slice(0, 8).map((item) => {
    const latitude = Number(item.lat);
    const longitude = Number(item.lon);

    return {
      id: item.place_id,
      name: item.display_name?.split(",")?.[0] ?? "Unknown place",
      fullAddress: item.display_name,
      latitude,
      longitude,
      openStreetMapUrl: `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`,
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    };
  });

export const generateTravelPlan = async (req, res) => {
  const { destination, days, preferences } = req.body ?? {};
  const parsedDays = Number(days);

  if (!destination || !Number.isFinite(parsedDays) || parsedDays < 1 || parsedDays > 14) {
    return res.status(400).json({
      message: "Please provide destination and days between 1 and 14."
    });
  }

  const fallbackPlan = buildFallbackPlan({
    destination: destination.trim(),
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
        temperature: 0.7,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Create a ${parsedDays}-day trip for ${destination}. Preferences: ${preferences || "general sightseeing + food"}. Return JSON with keys summary, tips(string[]), itinerary({day,morning,afternoon,evening}[]).`
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
    if (!content) {
      return res.json(fallbackPlan);
    }

    const parsed = JSON.parse(content);
    return res.json({
      source: "openai",
      ...parsed
    });
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

  const categoryQueryMap = {
    attractions: "top attractions",
    food: "popular restaurants",
    cafe: "best cafes",
    nightlife: "nightlife"
  };

  const query = `${location} ${categoryQueryMap[category] ?? category}`;

  try {
    const endpoint = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=12`;
    const response = await fetch(endpoint, {
      headers: {
        "User-Agent": "travel-social-app/1.0"
      }
    });

    if (!response.ok) {
      return res.status(502).json({ message: "Failed to fetch places." });
    }

    const data = await response.json();

    return res.json({
      location,
      category,
      results: normalizeNominatimResponse(data)
    });
  } catch {
    return res.status(500).json({ message: "Unable to fetch places right now." });
  }
};
