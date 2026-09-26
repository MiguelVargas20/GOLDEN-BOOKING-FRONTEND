// ═══════════════════════════════════════════════════════════
// Fechas SIEMPRE en hora local del navegador.
//
// Por qué existe: `new Date("2026-09-27")` NO es el 27 a medianoche local,
// es medianoche UTC, que en Colombia (UTC-5) es el 26 a las 7 p. m.; y
// `toISOString()` convierte a UTC y agrega una "Z". Eso corría un día las
// fechas del hotel. Aquí todo se interpreta y se envía en hora local.
// ═══════════════════════════════════════════════════════════

const pad = (n) => String(n).padStart(2, "0");
const SOLO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Date | "YYYY-MM-DD" | "YYYY-MM-DDTHH:mm[:ss]" (LocalDateTime del backend)
 * → Date en hora local. null/"" → null.
 */
export const aFecha = (valor) => {
  if (!valor) return null;
  if (valor instanceof Date) return valor;
  if (SOLO_FECHA.test(valor)) {
    const [a, m, d] = valor.split("-").map(Number);
    return new Date(a, m - 1, d);
  }
  return new Date(valor); // con hora y sin "Z" JavaScript ya la toma como local
};

/** Date → "YYYY-MM-DD" (fecha local, sin pasar por UTC). */
export const aTextoFecha = (fecha) =>
  `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}`;

/** Cualquier fecha → "YYYY-MM-DDT00:00:00" (el día, a medianoche local). */
export const aInicioDelDiaLocal = (valor) => `${aTextoFecha(aFecha(valor))}T00:00:00`;

/** Noches entre dos fechas (por día calendario, sin líos de horario de verano). */
export const nochesEntre = (checkIn, checkOut) => {
  const a = aFecha(checkIn);
  const b = aFecha(checkOut);
  if (!a || !b) return 0;
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcB - utcA) / 86400000);
};
