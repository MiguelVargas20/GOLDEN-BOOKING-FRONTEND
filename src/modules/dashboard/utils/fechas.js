const FORMATO_DIA = new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short" });
const FORMATO_DIA_LARGO = new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long" });

/**
 * "2026-09-25" (LocalDate) → Date local. `new Date("2026-09-25")` lo toma
 * como UTC y en Colombia mostraría el día anterior.
 */
const fechaLocal = (iso) => {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a, m - 1, d);
};

/** "25 sept" */
export const diaCorto = (iso) => FORMATO_DIA.format(fechaLocal(iso));

/** "jueves, 25 de septiembre" */
export const diaLargo = (iso) => FORMATO_DIA_LARGO.format(fechaLocal(iso));

/** "$ 1,2 M" / "$ 350 mil" para cifras grandes en las tarjetas. */
export const pesosCompactos = (valor) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", notation: "compact", maximumFractionDigits: 1,
  }).format(valor || 0);
