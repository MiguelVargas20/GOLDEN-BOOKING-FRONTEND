// ═══════════════════════════════════════════════════════════
// Utilidades compartidas por TODOS los archivos de api/.
// Antes esto estaba duplicado en cada archivo (ReservaHotelApi,
// HabitacionApi, ContactoApi...). Si el backend cambia el formato
// de error, ahora solo se corrige aquí.
// ═══════════════════════════════════════════════════════════

export const API_URL = import.meta.env.VITE_API_URL;

export const getToken = () => localStorage.getItem("token");

export const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// Extrae el mensaje real que manda el GlobalExceptionHandler del backend.
// Ahí el body siempre viene como { error: "..." } o, en validaciones,
// { errores: { campo: "mensaje" } }.
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