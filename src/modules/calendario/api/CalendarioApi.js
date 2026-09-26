import { API_URL, authHeaders, apiFetch, extraerMensajeError } from "../../../shared/api/apiUtils";

/** Ocupación de los 7 días desde "desde" (yyyy-MM-dd) de todos los espacios y habitaciones. */
export const obtenerCalendarioSemana = async (desde) => {
  const res = await apiFetch(`${API_URL}/api/calendario/semana?desde=${desde}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudo cargar el calendario."));
  return res.json();
};
