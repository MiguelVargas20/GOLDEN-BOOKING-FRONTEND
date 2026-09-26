import { API_URL, authHeaders, authHeaderToken, apiFetch, extraerMensajeError } from "../../../shared/api/apiUtils";

const BASE_URL = `${API_URL}/api/eventos`;

const pedir = async (url, opciones, error) => {
  const res = await apiFetch(url, { headers: authHeaders(), ...opciones });
  if (!res.ok) throw new Error(await extraerMensajeError(res, error));
  return res.status === 204 ? null : res.json();
};

/** Próximos eventos publicados (portada del cliente). */
export const listarProximosEventos = () => pedir(`${BASE_URL}/proximos`, {}, "No se pudieron cargar los eventos.");

/** Todos, incluidos borradores (ADMIN). */
export const listarEventos = () => pedir(BASE_URL, {}, "No se pudieron cargar los eventos.");

export const crearEvento = (evento) => pedir(BASE_URL, { method: "POST", body: JSON.stringify(evento) }, "No se pudo crear el evento.");

export const actualizarEvento = (id, evento) =>
  pedir(`${BASE_URL}/${id}`, { method: "PUT", body: JSON.stringify(evento) }, "No se pudo guardar el evento.");

export const eliminarEvento = (id) => pedir(`${BASE_URL}/${id}`, { method: "DELETE" }, "No se pudo eliminar el evento.");

export const subirImagenEvento = async (id, archivo) => {
  const datos = new FormData();
  datos.append("archivo", archivo);
  const res = await apiFetch(`${BASE_URL}/${id}/imagen`, { method: "POST", headers: authHeaderToken(), body: datos });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudo subir la imagen"));
  return res.json();
};

export const eliminarImagenEvento = (id) => pedir(`${BASE_URL}/${id}/imagen`, { method: "DELETE" }, "No se pudo quitar la imagen.");
