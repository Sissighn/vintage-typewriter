import axios from "axios";

const apiBaseUrl = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

/**
 * Global Axios instance for the Typewriter API.
 * The 'withCredentials' setting is mandatory for HttpOnly cookie sessions.
 */
const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true, // Crucial: Sends cookies automatically with every request
});

export default api;
