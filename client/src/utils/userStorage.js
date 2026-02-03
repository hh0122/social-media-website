const STORAGE_KEY = "pulse-users";

const normalizeUser = (user) => ({
  ...user,
  followers: Number.isInteger(user.followers) ? user.followers : 0,
  following: Number.isInteger(user.following) ? user.following : 0
});

const getUserKey = (user) => user?.handle ?? user?.id ?? "";

export const loadStoredUsers = () => {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeUser);
  } catch (error) {
    console.error("Failed to load stored users", error);
    return [];
  }
};

const saveStoredUsers = (users) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

export const storeUser = (user) => {
  const normalized = normalizeUser(user);
  const stored = loadStoredUsers();
  const deduped = stored.filter((entry) => getUserKey(entry) !== getUserKey(normalized));
  saveStoredUsers([...deduped, normalized]);
};

export const getAllUsers = (seedUsers = [], currentUser) => {
  const stored = loadStoredUsers();
  const combined = [...seedUsers, ...stored, currentUser].filter(Boolean);
  const byKey = new Map();
  combined.forEach((entry) => {
    const key = getUserKey(entry);
    if (!key) return;
    byKey.set(key, normalizeUser(entry));
  });
  return Array.from(byKey.values());
};
