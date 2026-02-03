const STORAGE_KEY = "pulse-stories-seen";

export const loadSeenStories = () => {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to load seen stories", error);
    return [];
  }
};

export const saveSeenStories = (stories) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
};
