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
  const datos = await res.json().catch(() => null);
  // Si responde algo que no es el panel (backend sin actualizar, proxy...), mejor
  // un mensaje claro que una pantalla en blanco
  if (!datos || !datos.indicadores || !Array.isArray(datos.tendencia)) {
    throw new Error("El servidor respondió algo inesperado. ¿El backend está actualizado a la última versión?");
  }
  return datos;
};
