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

/** URL de la imagen del espacio: la subida por el admin o la del deporte. */
export const imagenEspacio = (espacio) => {
  if (espacio?.imagenUrl) return `${API_URL}${espacio.imagenUrl}`;
  return IMAGENES_POR_DEPORTE[normalizar(espacio?.deporte)] || imgFutbol;
};
