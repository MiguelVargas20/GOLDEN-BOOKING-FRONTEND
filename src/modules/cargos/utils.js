export const CATEGORIAS_CARGO = {
  RESTAURANTE: "Restaurante",
  BAR: "Bar",
  TIENDA: "Tienda",
  SPA: "Spa",
  SERVICIO: "Servicio",
  OTRO: "Otro",
};

/** Consumos frecuentes para registrar con un clic (concepto, categoría y valor sugerido). */
export const CONSUMOS_RAPIDOS = [
  { concepto: "Agua", categoria: "RESTAURANTE", valor: 4000 },
  { concepto: "Gaseosa", categoria: "RESTAURANTE", valor: 5000 },
  { concepto: "Almuerzo del día", categoria: "RESTAURANTE", valor: 28000 },
  { concepto: "Cerveza", categoria: "BAR", valor: 9000 },
  { concepto: "Bloqueador solar", categoria: "TIENDA", valor: 35000 },
  { concepto: "Toalla adicional", categoria: "SERVICIO", valor: 10000 },
  { concepto: "Masaje relajante", categoria: "SPA", valor: 120000 },
];

export const DESTINOS_CARGO = {
  RESERVA_HOTEL: "Reserva de hotel",
  RESERVA_DEPORTE: "Reserva deportiva",
  CUENTA_SOCIO: "Cuenta de socio",
};
