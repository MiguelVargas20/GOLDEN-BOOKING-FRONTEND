import { API_URL, authHeaders, apiFetch, extraerMensajeError } from "../../../shared/api/apiUtils";

/**
 * Resumen del panel del administrador (ADMIN).
 * @param {number} dias - periodo de la tendencia y de los espacios más reservados (7 a 90)
 */
export const obtenerDashboard = async (dias = 14) => {
  const res = await apiFetch(`${API_URL}/api/dashboard?dias=${dias}`, { headers: authHeaders() });
  if (!res.ok) {
    // El código ayuda a diagnosticar: 404 = backend sin actualizar, 500 = error en el servidor
    const mensaje = await extraerMensajeError(res, "No se pudo cargar el panel");
    throw new Error(`${mensaje} (código ${res.status})`);
  }
  return res.json();
};
