// Reglas de horario para reservar un espacio deportivo (las mismas que valida
// el backend). Las usan la reserva del cliente y la de recepción (admin).

const UNA_HORA_MS = 60 * 60 * 1000;

/**
 * Date → "YYYY-MM-DDTHH:mm:ss" con la hora LOCAL del navegador
 * (toISOString() convertiría a UTC y correría la hora).
 */
export function toLocalISOString(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/** "HH:mm[:ss]" → minutos desde medianoche. */
const aMinutos = (hhmm) => {
  const [h, m] = (hhmm || "00:00").split(":").map(Number);
  return h * 60 + m;
};

const minutosDe = (fecha) => fecha.getHours() * 60 + fecha.getMinutes();

/** Entrada válida: no en el pasado y con al menos 1 hora antes del cierre. */
export const inicioValido = (espacio, h) =>
  h > new Date()
  && minutosDe(h) >= aMinutos(espacio?.horaApertura)
  && minutosDe(h) + 60 <= aMinutos(espacio?.horaCierre);

/** Salida válida: mismo día, al menos 1 hora después de la entrada y antes del cierre. */
export const finValido = (espacio, entrada, h) =>
  Boolean(entrada)
  && h.toDateString() === entrada.toDateString()
  && h.getTime() >= entrada.getTime() + UNA_HORA_MS
  && minutosDe(h) <= aMinutos(espacio?.horaCierre);

/** Salida sugerida al elegir la entrada: 1 hora después, si cabe en el horario. */
export const finSugerido = (espacio, entrada) => {
  const sugerida = new Date(entrada.getTime() + UNA_HORA_MS);
  return finValido(espacio, entrada, sugerida) ? sugerida : null;
};

/** Precio estimado según la tarifa por hora del espacio. */
export const precioEstimado = (espacio, inicio, fin) => {
  if (!inicio || !fin || fin <= inicio) return null;
  return Math.round(((fin - inicio) / UNA_HORA_MS) * (espacio?.tarifaHora || 0));
};
