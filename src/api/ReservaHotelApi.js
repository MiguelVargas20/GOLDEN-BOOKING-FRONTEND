// ═══════════════════════════════════════════════════════════
// ── Configuración Global y Autenticación ───────────────────
// ═══════════════════════════════════════════════════════════

const API_URL = import.meta.env.VITE_API_URL;

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

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
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al crear reserva");
  return data;
};

/**
 * Obtiene el listado completo de reservas de hotel (ADMIN).
 */
export const listarReservasHotel = async () => {
  const res = await fetch(`${API_URL}/api/reservas/hotel`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Error al cargar reservas");
  return data;
};

/**
 * Obtiene los detalles de una reserva específica de hotel mediante su ID.
 */
export const obtenerReservaHotelPorId = async (id) => {
  const res = await fetch(`${API_URL}/api/reservas/hotel/${id}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Reserva no encontrada");
  return data;
};

/**
 * Cancela una reserva de hotel existente mediante su ID (PATCH).
 */
export const cancelarReservaHotel = async (id) => {
  const res = await fetch(`${API_URL}/api/reservas/hotel/${id}/cancelar`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Error al cancelar reserva");
  return true;
};                                          {/* ← cierre correcto */}

/**
 * Lista las reservas hoteleras de un usuario específico (CLIENTE).
 */
export const listarMisReservasHotel = async (docUsuario) => {
  const res = await fetch(`${API_URL}/api/reservas/hotel/usuario/${docUsuario}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Error al cargar tus reservas");
  return data;
};