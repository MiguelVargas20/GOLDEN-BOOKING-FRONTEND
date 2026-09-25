// ═══════════════════════════════════════════════════════════
// Utilidades compartidas por TODOS los archivos de api/.
// Antes esto estaba duplicado en cada archivo (ReservaHotelApi,
// HabitacionApi, ContactoApi...). Si el backend cambia el formato
// de error, ahora solo se corrige aquí.
// ═══════════════════════════════════════════════════════════

export const API_URL = import.meta.env.VITE_API_URL;

// Busca el token en localStorage primero (sesión "recordada"); si no está
// ahí, en sessionStorage (sesión de esta pestaña/navegador únicamente).
// Debe reflejar la misma lógica que obtenerStorageActivo() en AuthContext.jsx.
const getToken = () => localStorage.getItem("token") || sessionStorage.getItem("token");

export const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ── Sesión invalidada por el backend ─────────────────────────
// El backend responde 401 con uno de estos códigos cuando el token ya no
// sirve: la cuenta fue desactivada/eliminada por el admin, la sesión expiró o
// el token no es válido. En esos casos no tiene sentido seguir en la app
// mostrando errores: AuthContext escucha este evento, avisa al usuario y
// cierra la sesión.
export const EVENTO_SESION_INVALIDA = "gb:sesion-invalida";
const CODIGOS_SESION_INVALIDA = ["CUENTA_INACTIVA", "SESION_EXPIRADA", "TOKEN_INVALIDO", "NO_AUTENTICADO"];

/**
 * fetch() para las llamadas autenticadas a la API. Igual que fetch, pero si
 * la respuesta es un 401 de sesión invalidada dispara EVENTO_SESION_INVALIDA.
 * Lee el cuerpo sobre un clon, así quien llama puede seguir leyendo la
 * respuesta normalmente.
 */
export const apiFetch = async (url, opciones) => {
  const res = await fetch(url, opciones);
  if (res.status === 401 && getToken()) {
    try {
      const data = await res.clone().json();
      if (CODIGOS_SESION_INVALIDA.includes(data?.codigo)) {
        window.dispatchEvent(new CustomEvent(EVENTO_SESION_INVALIDA, {
          detail: { codigo: data.codigo, mensaje: data.error },
        }));
      }
    } catch {
      // cuerpo no JSON: se deja pasar, quien llama maneja el error
    }
  }
  return res;
};

// Extrae el mensaje real que manda el GlobalExceptionHandler del backend.
// El body siempre viene como { codigo, error: "mensaje para el usuario", ... }
// (en validaciones además trae { errores: { campo: "mensaje" } }).
export const extraerMensajeError = async (res, fallback) => {
  try {
    const data = await res.json();
    if (data?.error) return data.error;
    if (data?.errores) return Object.values(data.errores).join(" | ");
    if (data?.message) return data.message;
  } catch {
    // el body no era JSON (ej. 401 sin body, error de red, etc.)
  }
  return `${fallback} (HTTP ${res.status})`;
};