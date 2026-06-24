const API_URL = import.meta.env.VITE_API_URL;

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${getToken()}`,
});

// ── Habitaciones ─────────────────────────────────────────
// GET /api/habitaciones
export const listarHabitaciones = async () => {
  const res = await fetch(`${API_URL}/api/habitaciones`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Error al cargar habitaciones");
  return data;
};

// GET /api/habitaciones/disponibles  (si tienes ese endpoint)
export const listarHabitacionesDisponibles = async () => {
  const res = await fetch(`${API_URL}/api/habitaciones/disponibles`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Error al cargar habitaciones disponibles");
  return data;
};

// GET /api/habitaciones/{id}
export const obtenerHabitacionPorId = async (id) => {
  const res = await fetch(`${API_URL}/api/habitaciones/${id}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Habitación no encontrada");
  return data;
};

// ── Tipos de habitación ───────────────────────────────────
// GET /api/tipohabitaciones
export const listarTiposHabitacion = async () => {
  const res = await fetch(`${API_URL}/api/tipohabitaciones`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Error al cargar tipos de habitación");
  return data;
};

// ── Reservas Hotel ────────────────────────────────────────
// POST /api/reservas/hotel
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

// GET /api/reservas/hotel
export const listarReservasHotel = async () => {
  const res = await fetch(`${API_URL}/api/reservas/hotel`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Error al cargar reservas");
  return data;
};

// GET /api/reservas/hotel/{id}
export const obtenerReservaHotelPorId = async (id) => {
  const res = await fetch(`${API_URL}/api/reservas/hotel/${id}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Reserva no encontrada");
  return data;
};

// PATCH /api/reservas/hotel/{id}/cancelar
export const cancelarReservaHotel = async (id) => {
  const res = await fetch(`${API_URL}/api/reservas/hotel/${id}/cancelar`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Error al cancelar reserva");
  return true;
};