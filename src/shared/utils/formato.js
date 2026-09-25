// Formatos de presentación compartidos (Colombia).

const FORMATO_FECHA_HORA = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
});
const FORMATO_FECHA = new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short", year: "numeric" });
const FORMATO_HORA = new Intl.DateTimeFormat("es-CO", { hour: "2-digit", minute: "2-digit" });
const FORMATO_PESOS = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

/** "01 oct 2026, 10:00 a. m." — acepta el LocalDateTime ISO que manda el backend. */
export const fechaHora = (valor) => (valor ? FORMATO_FECHA_HORA.format(new Date(valor)) : "—");

/** "01 oct 2026" */
export const fecha = (valor) => (valor ? FORMATO_FECHA.format(new Date(valor)) : "—");

/** "10:00 a. m." */
export const hora = (valor) => (valor ? FORMATO_HORA.format(new Date(valor)) : "—");

/** "$ 75.000" */
export const pesos = (valor) => (valor || valor === 0 ? FORMATO_PESOS.format(valor) : "—");
