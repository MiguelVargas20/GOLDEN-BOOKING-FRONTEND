import { authHeaders, extraerMensajeError, apiFetch } from "../../../shared/api/apiUtils";

const API_URL = import.meta.env.VITE_API_URL;

// Extrae el mensaje real que manda el GlobalExceptionHandler del backend.
// Ahí el body siempre viene como { error: "..." } o, en validaciones,
// { errores: { campo: "mensaje" } }. Si no logramos parsear nada,
// devolvemos un texto genérico como último recurso.

// ═══════════════════════════════════════════════════════════
// ── Reservas Hotel ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════════

/**
 * Registra una nueva reserva de hotel en el sistema.
 */
export const crearReservaHotel = async (reserva, confirmar = false) => {
  // confirmar: solo ADMIN (recepción) — registrar la reserva ya CONFIRMADA
  const res = await apiFetch(`${API_URL}/api/reservas/hotel${confirmar ? "?confirmar=true" : ""}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(reserva),
  });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "Error al crear reserva"));
  return res.json();
};

/**
 * Cancela una reserva de hotel existente mediante su ID (PATCH).
 */
export const cancelarReservaHotel = async (id, motivo = null) => {
  const res = await apiFetch(`${API_URL}/api/reservas/hotel/${id}/cancelar`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ motivo }),
  });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "Error al cancelar reserva"));
  return true;
};

/**
 * Listar todas las reservas de hotel (ADMIN), paginado y opcionalmente
 * filtrado por estado. Cada reserva trae nombreCliente y correoCliente.
 */
export const listarReservasHotelAdmin = async (page = 0, size = 10, estado = null) => {
  const params = new URLSearchParams({ page, size });
  if (estado) params.append("estado", estado);
  const res = await apiFetch(`${API_URL}/api/reservas/hotel?${params}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudieron cargar las reservas"));
  return res.json();
};

/** Cantidad de reservas por estado (ADMIN). */
export const obtenerResumenHotel = async () => {
  const res = await apiFetch(`${API_URL}/api/reservas/hotel/resumen`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudo cargar el resumen"));
  return res.json();
};

/** Aprobar reserva PENDIENTE (ADMIN). El cliente recibe un correo de confirmación. */
export const confirmarReservaHotel = async (id) => {
  const res = await apiFetch(`${API_URL}/api/reservas/hotel/${id}/confirmar`, { method: "PATCH", headers: authHeaders() });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudo aprobar la reserva"));
  return res.json();
};

/**
 * Lista las reservas hoteleras de un usuario específico (CLIENTE).
 */
export const listarMisReservasHotel = async () => {
  const res = await apiFetch(`${API_URL}/api/reservas/hotel/mis-reservas`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "Error al cargar tus reservas"));
  return res.json();
};

/**
 * Obtiene los rangos de fechas en los que una habitación específica
 * ya tiene reservas activas (no canceladas).
 * Se usa para bloquear esas fechas en el datepicker ANTES de que el
 * usuario intente reservar.
 */
export const obtenerFechasOcupadas = async (idHabitacion) => {
  const res = await apiFetch(`${API_URL}/api/reservas/hotel/habitacion/${idHabitacion}/ocupadas`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "Error al consultar disponibilidad"));
  return res.json(); // [{ checkIn: "...", checkOut: "..." }, ...]
};

/**
 * Cambia las fechas de la estadía sin cancelarla. Recibe los días "yyyy-MM-dd":
 * el backend fija el check-in a las 3:00 p. m. y el check-out a las 12:00 m.
 */
export const reprogramarReservaHotel = async (id, checkIn, checkOut) => {
  const res = await apiFetch(`${API_URL}/api/reservas/hotel/${id}/reprogramar`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ inicio: `${checkIn}T00:00:00`, fin: `${checkOut}T00:00:00` }),
  });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudo reprogramar la reserva"));
  return res.json();
};
