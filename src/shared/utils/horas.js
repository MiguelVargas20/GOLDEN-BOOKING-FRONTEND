// Horas en texto "HH:mm" y duraciones en minutos (selector de horario).

const pad = (n) => String(n).padStart(2, "0");

/** "HH:mm" → minutos desde medianoche. */
export const aMinutos = (hhmm) => { const [h, m] = (hhmm || "00:00").split(":").map(Number); return h * 60 + m; };

/** Minutos desde medianoche → "HH:mm". */
export const aHora = (min) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;

/** 90 → "1 h 30 min" */
export const textoDuracion = (min) => (min % 60 ? `${Math.floor(min / 60)} h 30 min` : `${min / 60} h`);
