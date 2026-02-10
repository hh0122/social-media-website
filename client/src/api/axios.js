import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_URL;
const defaultProductionApiUrl = "https://social-media-website-udcf.onrender.com/api";

const apiBaseUrl = configuredApiUrl || (import.meta.env.DEV ? "http://localhost:4000/api" : defaultProductionApiUrl);

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json"
  }
});

export default api;
