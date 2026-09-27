import { API_URL, authHeaders, authHeaderToken, apiFetch, extraerMensajeError } from "../../../shared/api/apiUtils";

const BASE_URL = `${API_URL}/api/reportes`;

/** Reporte en JSON (vista previa). Fechas "yyyy-MM-dd", ambas incluidas. */
export const obtenerReporte = async (desde, hasta) => {
  const res = await apiFetch(`${BASE_URL}?desde=${desde}&hasta=${hasta}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudo generar el reporte."));
  return res.json();
};

/**
 * Descarga el reporte en Excel o PDF (con el token, por eso no sirve un <a href>).
 * @param {"excel"|"pdf"} formato
 */
export const descargarReporte = async (formato, desde, hasta) => {
  const res = await apiFetch(`${BASE_URL}/${formato}?desde=${desde}&hasta=${hasta}`, { headers: authHeaderToken() });
  if (!res.ok) throw new Error(await extraerMensajeError(res, "No se pudo descargar el reporte."));
  const archivo = await res.blob();
  const url = URL.createObjectURL(archivo);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `reporte-reservas-${desde}-a-${hasta}.${formato === "excel" ? "xlsx" : "pdf"}`;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
