// ═══════════════════════════════════════════════════════════
// Utilidades para validar disponibilidad de habitaciones
// por rango de fechas (check-in / check-out).
// ═══════════════════════════════════════════════════════════
import { aFecha, aTextoFecha } from "../../../shared/utils/fechas";

/** Solo el día (medianoche local), para comparar estadías por fecha. */
const dia = (valor) => {
  const f = aFecha(valor);
  return new Date(f.getFullYear(), f.getMonth(), f.getDate()).getTime();
};

/**
 * ¿El rango [checkIn, checkOut) que el usuario está eligiendo se cruza
 * con alguno de los rangos ya ocupados que trajo el backend?
 *
 * Misma regla que el backend: se solapan si uno empieza antes de que el
 * otro termine. Si el check-out de uno coincide con el check-in del otro,
 * NO se considera solapamiento (como en cualquier hotel real).
 * Se compara por día y en hora local (antes "2026-09-27" se leía en UTC).
 */
export const haySolapamiento = (checkIn, checkOut, rangosOcupados) => {
  const inicioNuevo = dia(checkIn);
  const finNuevo = dia(checkOut);
  return rangosOcupados.some((rango) => dia(rango.checkIn) < finNuevo && dia(rango.checkOut) > inicioNuevo);
};

/** Date → "YYYY-MM-DD" con la fecha LOCAL (se mantiene por compatibilidad). */
export const toLocalDateString = aTextoFecha;
