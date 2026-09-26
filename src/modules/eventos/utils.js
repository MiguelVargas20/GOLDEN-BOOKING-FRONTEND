import { API_URL } from "../../shared/api/apiUtils";
import imgFestival from "../../assets/carrusel3.jpg";

export const CATEGORIAS_EVENTO = {
  BAILE: "Baile",
  RECREATIVO: "Recreativo",
  FESTIVAL: "Festival",
  DEPORTIVO: "Deportivo",
  CULTURAL: "Cultural",
  GASTRONOMICO: "Gastronómico",
  OTRO: "Otro",
};

/** Imagen del evento (la subida por el admin o una por defecto). */
export const imagenEvento = (evento) => (evento?.imagenUrl ? `${API_URL}${evento.imagenUrl}` : imgFestival);
