// ═══════════════════════════════════════════════════════════
// Utilidades para validar disponibilidad de habitaciones
// por rango de fechas (check-in / check-out).
// ═══════════════════════════════════════════════════════════

/**
 * ¿El rango [checkIn, checkOut) que el usuario está eligiendo se cruza
 * con alguno de los rangos ya ocupados que trajo el backend?
 *
 * Misma regla que usamos en el backend (seSolapan en el service):
 * dos rangos se solapan si uno empieza antes de que el otro termine,
 * en ambos sentidos. Si el check-out de uno coincide con el check-in
 * del otro, NO se considera solapamiento (como en cualquier hotel real).
 */
export const haySolapamiento = (checkIn, checkOut, rangosOcupados) => {
  const inicioNuevo = new Date(checkIn);
  const finNuevo = new Date(checkOut);

  return rangosOcupados.some((rango) => {
    const inicioOcupado = new Date(rango.checkIn);
    const finOcupado = new Date(rango.checkOut);
    return inicioOcupado < finNuevo && finOcupado > inicioNuevo;
  });
};

/**
 * Genera el set de días (formato "YYYY-MM-DD") que caen DENTRO de algún
 * rango ocupado, útil para pintar/deshabilitar celdas en un datepicker
 * nativo tipo <input type="date">, que no soporta rangos directamente
 * pero sí podemos usar esto para validar on-change.
 */
export const obtenerDiasOcupados = (rangosOcupados) => {
  const dias = new Set();
  rangosOcupados.forEach(({ checkIn, checkOut }) => {
    const actual = new Date(checkIn);
    const fin = new Date(checkOut);
    while (actual < fin) {
      dias.add(actual.toISOString().split("T")[0]);
      actual.setDate(actual.getDate() + 1);
    }
  });
  return dias;
};