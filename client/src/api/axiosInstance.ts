import axios from "axios";

/**
 * Global Axios instance for the Typewriter API.
 * The 'withCredentials' setting is mandatory for HttpOnly cookie sessions.
 */
const api = axios.create({
  baseURL: "http://localhost:5001/api",
  withCredentials: true, // Crucial: Sends cookies automatically with every request
});

export default api;
