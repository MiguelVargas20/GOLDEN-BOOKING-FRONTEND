import { API_URL, authHeaders, extraerMensajeError } from "./apiUtils";

const BASE_URL = `${API_URL}/api/contacto`;

// ═══════════════════════════════════════════════════════════
// PÚBLICO
// ═══════════════════════════════════════════════════════════

/**
 * Envía un mensaje de contacto.
 * @param {Object} data - { nombre, correo, contenido }
 */
export const enviarMensaje = async (data) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudo enviar el mensaje"));
  return res.json();
};

// ═══════════════════════════════════════════════════════════
// ADMINISTRADOR (ADMIN)
// ═══════════════════════════════════════════════════════════

/**
 * Lista los mensajes de contacto paginados, opcionalmente filtrados por nombre.
 * @param {number} page - Número de página (default 0)
 * @param {number} size - Cantidad de elementos por página (default 10)
 * @param {string} [nombre] - Búsqueda parcial opcional por nombre del remitente
 */
export const listarMensajes = async (page = 0, size = 10, nombre = "") => {
  const params = new URLSearchParams({ page, size });
  if (nombre.trim()) params.append("nombre", nombre.trim());

  const res = await fetch(`${BASE_URL}?${params.toString()}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudieron cargar los mensajes"));
  return res.json();
};

/**
 * Marca un mensaje como leído (ADMIN).
 */
export const marcarMensajeLeido = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}/leido`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudo actualizar el mensaje"));
  return res.json();
};

/**
 * Cuenta cuántos mensajes están sin leer (ADMIN).
 * Usado por el badge/banner del Navbar.
 */
export const contarMensajesNoLeidos = async () => {
  const res = await fetch(`${BASE_URL}/no-leidos/count`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudo consultar mensajes nuevos"));
  return res.json(); // Devuelve { noLeidos: number }
};

/**
 * Envía la respuesta del administrador a un mensaje puntual.
 */
export const responderMensaje = async (id, respuesta) => {
  const res = await fetch(`${BASE_URL}/${id}/responder`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ respuesta }),
  });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudo enviar la respuesta."));
  return res.json();
};

// ═══════════════════════════════════════════════════════════
// USUARIO CLIENTE (LOGUEADO)
// ═══════════════════════════════════════════════════════════

/**
 * Historial de mensajes que el usuario logueado ha enviado con sus respuestas.
 */
export const obtenerMisMensajes = async (pagina = 0, size = 10) => {
  const params = new URLSearchParams({ page: pagina, size });
  const res = await fetch(`${BASE_URL}/mios?${params.toString()}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudieron cargar tus mensajes."));
  return res.json();
};

/**
 * Cuenta cuántas respuestas nuevas tiene el usuario sin ver.
 * Usado por la campanita de notificaciones.
 */
export const contarRespuestasNoVistas = async () => {
  const res = await fetch(`${BASE_URL}/mios/no-vistas/count`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudo obtener el contador."));
  return res.json(); // Devuelve { noVistas: number }
};

/**
 * Marca como vista la respuesta enviada por el administrador a un mensaje.
 */
export const marcarRespuestaVista = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}/respuesta-vista`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudo actualizar."));
  return res.json();
};