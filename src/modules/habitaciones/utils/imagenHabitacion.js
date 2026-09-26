import { API_URL } from "../../../shared/api/apiUtils";

/** Imagen por defecto cuando la habitación no tiene una subida por el admin. */
export const IMAGEN_HABITACION_POR_DEFECTO =
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80";

/**
 * URL de la imagen de la habitación. El backend devuelve una ruta relativa
 * ("/api/habitaciones/{id}/imagen?v=..."): hay que anteponer la URL del
 * backend, si no el navegador la buscaría en el dominio del front (Vercel).
 */
export const imagenHabitacion = (habitacion) =>
  habitacion?.imagenUrl ? `${API_URL}${habitacion.imagenUrl}` : IMAGEN_HABITACION_POR_DEFECTO;

// Respaldo local (sin internet ni servicios externos): una cama sobre fondo suave
const IMAGEN_LOCAL = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250">
  <rect width="400" height="250" fill="#fef3e6"/>
  <g fill="none" stroke="#f38d1e" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M110 170v-60m0 30h180a20 20 0 0 1 20 20v10m-200 0h200m0 0v20m-200-20v20"/>
    <rect x="130" y="112" width="44" height="26" rx="8"/>
  </g>
</svg>`)}`;

/**
 * onError para <img>: si la imagen no carga (subida borrada, sin internet...)
 * prueba la imagen por defecto y, si tampoco carga, la ilustración local.
 */
export const usarImagenDeRespaldoHabitacion = (evento) => {
  const img = evento.currentTarget;
  const intento = Number(img.dataset.respaldo || 0);
  if (intento === 0 && img.src !== IMAGEN_HABITACION_POR_DEFECTO) {
    img.dataset.respaldo = "1";
    img.src = IMAGEN_HABITACION_POR_DEFECTO;
  } else if (intento < 2) {
    img.dataset.respaldo = "2";
    img.src = IMAGEN_LOCAL;
  }
};
