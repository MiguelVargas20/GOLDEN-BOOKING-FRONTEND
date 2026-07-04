import axios from "axios";

/**
 * Instancia central de Axios con refresh automático de access token.
 *
 * Cómo integrarla en tu proyecto (GOLDEN-BOOKING-FRONTEND/src/api/):
 * 1. Copia este archivo como `src/api/axiosInstance.js`.
 * 2. En ContactoApi.js, HabitacionApi.js, ReservaDeporteApi.js, ReservaHotelApi.js,
 *    UserApi.js: reemplaza el `axios.get/post/...` directo por `api.get/post/...`
 *    importando `import api from "./axiosInstance";`.
 * 3. Guarda el access token en memoria (por ejemplo en tu AuthContext, en un
 *    useState/useRef), NUNCA en localStorage — así una vulnerabilidad XSS no
 *    puede robarlo persistentemente. El refresh token vive en una cookie
 *    httpOnly que el navegador maneja solo; tu JS nunca la toca.
 */

const BASE_URL = "http://localhost:8080"; // ajusta según tu entorno

// Guardamos el access token actual en un closure, no en localStorage.
let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // imprescindible: permite que la cookie refreshToken viaje y se guarde
});

// Adjunta el access token vigente a cada petición saliente
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Evita disparar varios /auth/refresh en paralelo si varias peticiones
// fallan con 401 al mismo tiempo (ej. al cargar una página con varios fetch).
let refrescando = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Si el que falló YA es el propio /auth/refresh o /auth/login, no reintentar
    const esRutaAuth =
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/login");

    if (status === 401 && !originalRequest._retry && !esRutaAuth) {
      originalRequest._retry = true;

      try {
        if (!refrescando) {
          refrescando = axios
            .post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true })
            .then((res) => {
              setAccessToken(res.data.token);
              return res.data.token;
            })
            .finally(() => {
              refrescando = null;
            });
        }

        const nuevoToken = await refrescando;
        originalRequest.headers.Authorization = `Bearer ${nuevoToken}`;
        return api(originalRequest); // reintenta la petición original ya con el token nuevo
      } catch (refreshError) {
        // El refresh token también expiró/fue revocado (reuso detectado, etc.)
        setAccessToken(null);
        // Aquí es buen lugar para redirigir a /login o limpiar tu AuthContext.
        // Ej: window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;