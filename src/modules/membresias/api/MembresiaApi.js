import { API_URL, authHeaders, apiFetch, extraerMensajeError } from "../../../shared/api/apiUtils";

const BASE_URL = `${API_URL}/api/membresias`;

/** Categoría, beneficios y reservas del usuario autenticado. */
export const obtenerMiMembresia = async () => {
  const res = await apiFetch(`${BASE_URL}/mia`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudo cargar tu membresía."));
  return res.json();
};

export const obtenerConfigMembresia = async () => {
  const res = await apiFetch(`${BASE_URL}/config`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudo cargar la configuración."));
  return res.json();
};

export const guardarConfigMembresia = async (config) => {
  const res = await apiFetch(`${BASE_URL}/config`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(config) });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudo guardar la configuración."));
  return res.json();
};

export const listarSocios = async () => {
  const res = await apiFetch(`${BASE_URL}/socios`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudieron cargar los clientes."));
  return res.json();
};

/** @param {"NINGUNA"|"OCASIONAL"|"MIEMBRO"} tipo */
export const asignarMembresia = async (idUsuario, tipo) => {
  const res = await apiFetch(`${BASE_URL}/socios/${idUsuario}?tipo=${tipo}`, { method: "PATCH", headers: authHeaders() });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudo cambiar la membresía."));
  return res.json();
};
