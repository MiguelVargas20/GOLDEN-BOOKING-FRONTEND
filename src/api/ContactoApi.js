import { API_URL, authHeaders, extraerMensajeError } from "./apiUtils";

const BASE_URL = `${API_URL}/api/contacto`;

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

/**
 * Lista los mensajes de contacto paginados (ADMIN).
 * El backend devuelve { contenido, paginaActual, totalPaginas, totalElementos }
 */
export const listarMensajes = async (page = 0, size = 10) => {
  const res = await fetch(`${BASE_URL}?page=${page}&size=${size}`, {
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
 * Lo usa el badge/banner en el Navbar.
 */
export const contarMensajesNoLeidos = async () => {
  const res = await fetch(`${BASE_URL}/no-leidos/count`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudo consultar mensajes nuevos"));
  return res.json(); // { noLeidos: number }
};