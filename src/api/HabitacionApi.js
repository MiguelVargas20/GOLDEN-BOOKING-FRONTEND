const API_URL = import.meta.env.VITE_API_URL;

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${getToken()}`,
});

// ── Habitaciones ─────────────────────────────────────────
export const listarHabitaciones = async () => {
  const res = await fetch(`${API_URL}/api/habitaciones`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error("Error al cargar habitaciones");
  return data;
};

export const listarHabitacionesDisponibles = async () => {
  const res = await fetch(`${API_URL}/api/habitaciones/disponibles`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error("Error al cargar habitaciones disponibles");
  return data;
};

export const obtenerHabitacionPorId = async (id) => {
  const res = await fetch(`${API_URL}/api/habitaciones/${id}`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error("Habitación no encontrada");
  return data;
};

export const crearHabitacion = async (dto) => {
  const res = await fetch(`${API_URL}/api/habitaciones`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(dto),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al crear habitación");
  return data;
};

export const actualizarHabitacion = async (id, dto) => {
  const res = await fetch(`${API_URL}/api/habitaciones/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(dto),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al actualizar habitación");
  return data;
};

export const eliminarHabitacion = async (id) => {
  const res = await fetch(`${API_URL}/api/habitaciones/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Error al eliminar habitación");
  return true;
};

// ── Tipos de habitación ───────────────────────────────────
export const listarTiposHabitacion = async () => {
  const res = await fetch(`${API_URL}/api/tipohabitaciones`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error("Error al cargar tipos");
  return data;
};

// ── Reservas Hotel ────────────────────────────────────────
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

export const listarReservasHotel = async () => {
  const res = await fetch(`${API_URL}/api/reservas/hotel`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error("Error al cargar reservas");
  return data;
};

export const cancelarReservaHotel = async (id) => {
  const res = await fetch(`${API_URL}/api/reservas/hotel/${id}/cancelar`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Error al cancelar reserva");
  return true;
};