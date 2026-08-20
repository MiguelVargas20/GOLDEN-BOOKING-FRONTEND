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

export const extraerMensajeError = async (response) => {
  try {
    const data = await response.json();
    return data.error || data.message || "Ocurrió un error inesperado";
  } catch {
    return "Ocurrió un error inesperado";
  }
};