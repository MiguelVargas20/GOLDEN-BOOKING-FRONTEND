import { API_URL, authHeaders, apiFetch, extraerMensajeError } from "../../../shared/api/apiUtils";

/**
 * Resumen del panel del administrador (ADMIN).
 * @param {number} dias - periodo de la tendencia y de los espacios más reservados (7 a 90)
 */
export const obtenerDashboard = async (dias = 14) => {
  const res = await apiFetch(`${API_URL}/api/dashboard?dias=${dias}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudo cargar el panel"));
  return res.json();
};
