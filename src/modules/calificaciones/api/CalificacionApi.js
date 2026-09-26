import { API_URL, authHeaders, apiFetch, extraerMensajeError } from "../../../shared/api/apiUtils";

const BASE_URL = `${API_URL}/api/calificaciones`;

/**
 * Califica una reserva finalizada.
 * @param {"DEPORTE"|"HOTEL"} categoria
 */
export const calificarReserva = async (categoria, idReserva, puntuacion, comentario) => {
  const res = await apiFetch(BASE_URL, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ categoria, idReserva, puntuacion, comentario }),
  });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudo guardar la calificación."));
  return res.json();
};

/** @returns {Promise<Object>} { [idRecurso]: { promedio, total } } */
export const obtenerResumenCalificaciones = async (categoria) => {
  const res = await apiFetch(`${BASE_URL}/resumen?categoria=${categoria}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudieron cargar las calificaciones."));
  const lista = await res.json();
  return Object.fromEntries(lista.map((r) => [r.idRecurso, r]));
};

/** Opiniones más recientes de un espacio o habitación. */
export const listarOpiniones = async (categoria, idRecurso) => {
  const res = await apiFetch(`${BASE_URL}?categoria=${categoria}&idRecurso=${encodeURIComponent(idRecurso)}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudieron cargar las opiniones."));
  return res.json();
};

/** Calificaciones del cliente autenticado. */
export const listarMisCalificaciones = async () => {
  const res = await apiFetch(`${BASE_URL}/mias`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudieron cargar tus calificaciones."));
  return res.json();
};
