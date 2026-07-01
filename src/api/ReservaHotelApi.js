// ═══════════════════════════════════════════════════════════
// ── Configuración Global y Autenticación ───────────────────
// ═══════════════════════════════════════════════════════════

const API_URL = import.meta.env.VITE_API_URL;

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// Extrae el mensaje real que manda el GlobalExceptionHandler del backend.
// Ahí el body siempre viene como { error: "..." } o, en validaciones,
// { errores: { campo: "mensaje" } }. Si no logramos parsear nada,
// devolvemos un texto genérico como último recurso.
const extraerMensajeError = async (res, fallback) => {
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

// ═══════════════════════════════════════════════════════════
// ── Reservas Hotel ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════════

/**
 * Registra una nueva reserva de hotel en el sistema.
 */
export const crearReservaHotel = async (reserva) => {
  const res = await fetch(`${API_URL}/api/reservas/hotel`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(reserva),
  });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "Error al crear reserva"));
  return res.json();
};

/**
 * Obtiene el listado completo de reservas de hotel (ADMIN).
 */
export const listarReservasHotel = async () => {
  const res = await fetch(`${API_URL}/api/reservas/hotel`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "Error al cargar reservas"));
  return res.json();
};

/**
 * Obtiene los detalles de una reserva específica de hotel mediante su ID.
 */
export const obtenerReservaHotelPorId = async (id) => {
  const res = await fetch(`${API_URL}/api/reservas/hotel/${id}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "Reserva no encontrada"));
  return res.json();
};

/**
 * Cancela una reserva de hotel existente mediante su ID (PATCH).
 */
export const cancelarReservaHotel = async (id) => {
  const res = await fetch(`${API_URL}/api/reservas/hotel/${id}/cancelar`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "Error al cancelar reserva"));
  return true;
};

/**
 * Lista las reservas hoteleras de un usuario específico (CLIENTE).
 */
export const listarMisReservasHotel = async () => {
  const res = await fetch(`${API_URL}/api/reservas/hotel/mis-reservas`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "Error al cargar tus reservas"));
  return res.json();
};