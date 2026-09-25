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
export const crearReservaHotel = async (reserva) => {
  const res = await apiFetch(`${API_URL}/api/reservas/hotel`, {
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
export const cancelarReservaHotel = async (id) => {
  const res = await apiFetch(`${API_URL}/api/reservas/hotel/${id}/cancelar`, {
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