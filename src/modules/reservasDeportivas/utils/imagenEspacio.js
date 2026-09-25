import { API_URL } from "../../../shared/api/apiUtils";

import imgFutbol from "../../../assets/futbol.png";
import imgBasket from "../../../assets/basketball.png";
import imgTennis from "../../../assets/imgTennis.png";
import imgNatacion from "../../../assets/natacion.png";
import imgGolf from "../../../assets/golf.jpg";
import imgVoleybol from "../../../assets/imgVoleybol.png";
import imgPingPong from "../../../assets/imgPingPong.png";
import imgPatinaje from "../../../assets/imgPatinaje.png";
import imgHockey from "../../../assets/imgHockey.png";
import imgCiclismo from "../../../assets/imgCiclismo.png";

// Imagen por defecto según el deporte (se usa cuando el admin no subió una).
// La clave es el nombre del deporte sin tildes y en minúsculas.
const IMAGENES_POR_DEPORTE = {
  futbol: imgFutbol,
  basketball: imgBasket,
  baloncesto: imgBasket,
  tennis: imgTennis,
  tenis: imgTennis,
  natacion: imgNatacion,
  golf: imgGolf,
  voleybol: imgVoleybol,
  voleibol: imgVoleybol,
  "ping pong": imgPingPong,
  patinaje: imgPatinaje,
  hockey: imgHockey,
  ciclismo: imgCiclismo,
};

const normalizar = (texto) =>
  (texto || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/** Deportes con imagen por defecto (para sugerirlos en el formulario del admin). */
export const DEPORTES_SUGERIDOS = [
  "Fútbol", "Basketball", "Tennis", "Natación", "Golf", "Voleybol", "Ping Pong", "Patinaje", "Hockey", "Ciclismo",
];

/** Imagen por defecto del deporte del espacio. */
const imagenDelDeporte = (espacio) => IMAGENES_POR_DEPORTE[normalizar(espacio?.deporte)] || imgFutbol;

/** URL de la imagen del espacio: la subida por el admin o la del deporte. */
export const imagenEspacio = (espacio) => {
  if (espacio?.imagenUrl) return `${API_URL}${espacio.imagenUrl}`;
  return imagenDelDeporte(espacio);
};

/**
 * onError para <img>: si la imagen subida no carga (backend caído, imagen
 * eliminada...) se muestra la del deporte en vez del ícono de imagen rota.
 * Se aplica una sola vez para no entrar en un ciclo si también fallara.
 */
export const usarImagenDeRespaldo = (espacio) => (evento) => {
  const img = evento.currentTarget;
  if (img.dataset.respaldo) return;
  img.dataset.respaldo = "1";
  img.src = imagenDelDeporte(espacio);
};

// Mismas reglas que valida el backend (EspacioDeportivoServiceImpl)
export const REGLAS_IMAGEN = {
  tipos: ["image/jpeg", "image/png", "image/webp"],
  tamanioMaximo: 5 * 1024 * 1024,
  anchoMinimo: 400,
  altoMinimo: 300,
  ladoMaximo: 8000,
};

/**
 * Valida una imagen ANTES de subirla: formato, peso y dimensiones.
 * @returns {Promise<string|null>} mensaje de error, o null si es válida.
 */
export const validarImagen = (archivo) => new Promise((resolver) => {
  if (!REGLAS_IMAGEN.tipos.includes(archivo.type)) {
    resolver("Formato no permitido. Sube una imagen JPG, PNG o WEBP.");
    return;
  }
  if (archivo.size > REGLAS_IMAGEN.tamanioMaximo) {
    resolver("La imagen pesa más de 5 MB.");
    return;
  }
  const url = URL.createObjectURL(archivo);
  const img = new Image();
  img.onload = () => {
    URL.revokeObjectURL(url);
    const { naturalWidth: ancho, naturalHeight: alto } = img;
    if (ancho < REGLAS_IMAGEN.anchoMinimo || alto < REGLAS_IMAGEN.altoMinimo) {
      resolver(`La imagen es muy pequeña (${ancho}×${alto} px). El mínimo es ${REGLAS_IMAGEN.anchoMinimo}×${REGLAS_IMAGEN.altoMinimo} px.`);
    } else if (ancho > REGLAS_IMAGEN.ladoMaximo || alto > REGLAS_IMAGEN.ladoMaximo) {
      resolver(`La imagen es demasiado grande (${ancho}×${alto} px). El máximo es ${REGLAS_IMAGEN.ladoMaximo} px por lado.`);
    } else {
      resolver(null);
    }
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    resolver("El archivo está dañado o no es una imagen válida.");
  };
  img.src = url;
});
