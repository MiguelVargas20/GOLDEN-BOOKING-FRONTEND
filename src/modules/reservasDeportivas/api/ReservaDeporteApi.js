import { authHeaders, extraerMensajeError, apiFetch } from "../../../shared/api/apiUtils";

const API_URL = `${import.meta.env.VITE_API_URL}/api/reservas/deporte`;

// Crear reserva (POST)
export const crearReservaDeporte = async (data) => {
  const response = await apiFetch(API_URL, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });

  // Antes leía responseJson.message, pero el backend manda el motivo en
  // "error" (o "errores" si es validación): el usuario siempre veía el
  // mensaje genérico en vez de, por ejemplo, "La cancha ya está reservada".
  if (!response.ok) {
    throw new Error(await extraerMensajeError(response, "Error al crear la reserva"));
  }
  return response.json();
};

/**
 * Listar todas las reservas (ADMIN), paginado y opcionalmente filtrado por
 * estado. Cada reserva trae nombreCliente y correoCliente.
 */
export const listarReservasDeporte = async (page = 0, size = 10, estado = null) => {
  const params = new URLSearchParams({ page, size });
  if (estado) params.append("estado", estado);
  const response = await apiFetch(`${API_URL}?${params}`, { headers: authHeaders() });
  if (!response.ok) throw new Error(await extraerMensajeError(response, "No se pudieron cargar las reservas"));
  return response.json();
};

/** Cantidad de reservas por estado (ADMIN): { PENDIENTE, CONFIRMADA, CANCELADA, FINALIZADA }. */
export const obtenerResumenDeporte = async () => {
  const response = await apiFetch(`${API_URL}/resumen`, { headers: authHeaders() });
  if (!response.ok) throw new Error(await extraerMensajeError(response, "No se pudo cargar el resumen"));
  return response.json();
};

/** Aprobar reserva PENDIENTE (ADMIN). El cliente recibe un correo de confirmación. */
export const confirmarReservaDeporte = async (id) => {
  const response = await apiFetch(`${API_URL}/${id}/confirmar`, { method: "PATCH", headers: authHeaders() });
  if (!response.ok) throw new Error(await extraerMensajeError(response, "No se pudo aprobar la reserva"));
  return response.json();
};

// Listar reservas del usuario logueado (GET) — para CLIENTE
// ANTES: pedía 100 reservas de todos y filtraba en el navegador
export const listarMisReservasDeporte = async () => {
  const response = await apiFetch(`${API_URL}/mis-reservas`, {
    headers: authHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Error al cargar reservas");
  return data; // ya viene filtrado y seguro desde el backend
};

// Horarios ya ocupados de TODAS las canchas (GET) — para ADMIN o CLIENTE
// Endpoint nuevo: antes el calendario de disponibilidad llamaba a
// listarReservasDeporte() (admin-only) y, para un CLIENTE, la llamada
// fallaba en silencio dejando el calendario siempre "vacío".
export const obtenerFechasOcupadasDeporte = async () => {
  const response = await apiFetch(`${API_URL}/ocupadas`, {
    headers: authHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "No se pudieron cargar los horarios ocupados");
  return data;
};

/**
 * Cancelar reserva. El admin debe enviar un motivo (se le envía al cliente);
 * para el cliente es opcional.
 */
export const cancelarReservaDeporte = async (id, motivo = null) => {
  const response = await apiFetch(`${API_URL}/${id}/cancelar`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ motivo }),
  });
  // Antes el throw quedaba DENTRO del try, así que el catch lo atrapaba y
  // siempre se mostraba el mensaje genérico (nunca "No se puede cancelar con
  // menos de 24h de anticipación", por ejemplo).
  if (!response.ok) {
    throw new Error(await extraerMensajeError(response, "No se pudo cancelar la reserva"));
  }
  return true;
};