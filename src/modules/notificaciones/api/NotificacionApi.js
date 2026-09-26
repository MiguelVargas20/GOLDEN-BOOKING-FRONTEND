import { API_URL, authHeaders, apiFetch, extraerMensajeError } from "../../../shared/api/apiUtils";

const BASE_URL = `${API_URL}/api/notificaciones`;

/** Notificaciones del usuario autenticado (las 30 más recientes). */
export const listarNotificaciones = async () => {
  const res = await apiFetch(BASE_URL, { headers: authHeaders() });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudieron cargar las notificaciones."));
  return res.json();
};

/** @returns {Promise<number>} cuántas hay sin leer */
export const contarNotificacionesNoLeidas = async () => {
  const res = await apiFetch(`${BASE_URL}/no-leidas/count`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudo obtener el contador."));
  const data = await res.json();
  return data.noLeidas ?? 0;
};

export const marcarNotificacionLeida = async (id) => {
  const res = await apiFetch(`${BASE_URL}/${id}/leida`, { method: "PATCH", headers: authHeaders() });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudo actualizar la notificación."));
  return res.json();
};

export const marcarTodasLeidas = async () => {
  const res = await apiFetch(`${BASE_URL}/leidas`, { method: "PATCH", headers: authHeaders() });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudieron marcar las notificaciones."));
  return res.json();
};
