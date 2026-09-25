import { API_URL, authHeaders, authHeaderToken, extraerMensajeError, apiFetch } from "../../../shared/api/apiUtils";

const BASE_URL = `${API_URL}/api/espacios-deportivos`;

// ═══════════════════════════════════════════════════════════
// Espacios deportivos (canchas, piscinas, pistas...)
// El ADMIN los crea y administra; el CLIENTE los ve en el catálogo.
// ═══════════════════════════════════════════════════════════

/** Lista los espacios. El admin recibe todos; el cliente, los ACTIVOS y en MANTENIMIENTO. */
export const listarEspacios = async () => {
  const res = await apiFetch(BASE_URL, { headers: authHeaders() });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudieron cargar los espacios deportivos"));
  return res.json();
};

/** @param {Object} espacio - { nombre, deporte, descripcion, capacidad, tarifaHora, horaApertura, horaCierre, estado } */
export const crearEspacio = async (espacio) => {
  const res = await apiFetch(BASE_URL, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(espacio),
  });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudo crear el espacio"));
  return res.json();
};

export const actualizarEspacio = async (id, espacio) => {
  const res = await apiFetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(espacio),
  });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudo actualizar el espacio"));
  return res.json();
};

/** @param {"ACTIVO"|"MANTENIMIENTO"|"INACTIVO"} estado */
export const cambiarEstadoEspacio = async (id, estado) => {
  const res = await apiFetch(`${BASE_URL}/${id}/estado?estado=${estado}`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudo cambiar el estado"));
  return res.json();
};

export const eliminarEspacio = async (id) => {
  const res = await apiFetch(`${BASE_URL}/${id}`, { method: "DELETE", headers: authHeaders() });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudo eliminar el espacio"));
  return true;
};

/** Sube o reemplaza la imagen (JPG, PNG o WEBP de hasta 5 MB). */
export const subirImagenEspacio = async (id, archivo) => {
  const datos = new FormData();
  datos.append("archivo", archivo);
  const res = await apiFetch(`${BASE_URL}/${id}/imagen`, {
    method: "POST",
    headers: authHeaderToken(),
    body: datos,
  });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudo subir la imagen"));
  return res.json();
};

/** Quita la imagen subida: el espacio vuelve a la imagen por defecto de su deporte. */
export const eliminarImagenEspacio = async (id) => {
  const res = await apiFetch(`${BASE_URL}/${id}/imagen`, { method: "DELETE", headers: authHeaders() });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudo quitar la imagen"));
  return res.json();
};
