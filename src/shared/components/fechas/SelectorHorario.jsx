import { useMemo } from "react";
import { BsSun, BsCloudSun, BsMoonStars } from "react-icons/bs";
import { aFecha, aTextoFecha } from "../../utils/fechas";
import { aMinutos, aHora, textoDuracion } from "../../utils/horas";
import "./SelectorHorario.css";

const PASO = 30;
const MINIMO = 60;
const MAXIMO = 4 * 60; // más de 4 horas seguidas se gestionan con la administración
const FRANJAS = [
  { nombre: "Mañana", icono: <BsSun />, hasta: 12 * 60 },
  { nombre: "Tarde", icono: <BsCloudSun />, hasta: 18 * 60 },
  { nombre: "Noche", icono: <BsMoonStars />, hasta: 24 * 60 },
];

/**
 * Elegir hora de entrada y duración con botones (en vez de una lista larga).
 * Respeta el horario del espacio, las horas ya pasadas y las reservas del día.
 *
 * @param {Object} espacio - { horaApertura, horaCierre }
 * @param {string} dia - "yyyy-MM-dd"
 * @param {Array<{inicio: Date, fin: Date}>} ocupados - reservas de ese día
 * @param {string} hora - "HH:mm" elegida o ""
 * @param {number} duracion - minutos
 * @param {({hora, duracion}) => void} onCambio
 */
export default function SelectorHorario({ espacio, dia, ocupados = [], hora, duracion, onCambio }) {
  const apertura = aMinutos(espacio?.horaApertura?.slice(0, 5) || "06:00");
  const cierre = aMinutos(espacio?.horaCierre?.slice(0, 5) || "22:00");

  // Rangos ocupados de ese día, en minutos
  const bloqueados = useMemo(() => ocupados
    .filter((o) => aTextoFecha(o.inicio) === dia)
    .map((o) => ({ desde: o.inicio.getHours() * 60 + o.inicio.getMinutes(), hasta: o.fin.getHours() * 60 + o.fin.getMinutes() })),
  [ocupados, dia]);

  const ahora = new Date();
  const esHoy = dia === aTextoFecha(ahora);
  const minutoActual = ahora.getHours() * 60 + ahora.getMinutes();
  const cruza = (desde, hasta) => bloqueados.some((b) => desde < b.hasta && hasta > b.desde);

  // Horas de entrada cada 30 min, dejando al menos 1 hora antes del cierre
  const horas = [];
  for (let m = apertura; m + MINIMO <= cierre; m += PASO) {
    const pasada = esHoy && m <= minutoActual;
    horas.push({ minuto: m, texto: aHora(m), libre: !pasada && !cruza(m, m + MINIMO), pasada });
  }

  // Duraciones posibles desde la hora elegida: hasta el cierre o la siguiente reserva
  const duraciones = [];
  if (hora) {
    const inicio = aMinutos(hora);
    for (let d = MINIMO; d <= MAXIMO && inicio + d <= cierre && !cruza(inicio, inicio + d); d += PASO) duraciones.push(d);
  }

  if (!dia) return <p className="sh-ayuda">Primero elige el día.</p>;
  if (!horas.some((h) => h.libre)) return <p className="sh-ayuda">No quedan horarios disponibles ese día. Elige otro día.</p>;

  const elegirHora = (h) => {
    const inicio = aMinutos(h);
    // conserva la duración si sigue cabiendo; si no, 1 hora
    const cabe = duracion <= MAXIMO && inicio + duracion <= cierre && !cruza(inicio, inicio + duracion);
    onCambio({ hora: h, duracion: cabe ? duracion : MINIMO });
  };

  // Horas agrupadas por mañana, tarde y noche
  const porFranja = FRANJAS.map((f, i) => ({
    ...f,
    horas: horas.filter((h) => h.minuto >= (i === 0 ? 0 : FRANJAS[i - 1].hasta) && h.minuto < f.hasta),
  })).filter((f) => f.horas.length > 0);

  return (
    <div className="sh">
      <span className="sh-titulo">Hora de entrada</span>
      {porFranja.map((f) => {
        const deLaFranja = f.horas;
        return (
          <div key={f.nombre} className="sh-franja">
            <span className="sh-franja-nombre">{f.icono} {f.nombre}</span>
            <div className="sh-grilla">
              {deLaFranja.map((h) => (
                <button key={h.texto} type="button" data-hora={h.texto} disabled={!h.libre}
                  className={`sh-hora ${hora === h.texto ? "activa" : ""} ${!h.libre && !h.pasada ? "ocupada" : ""}`}
                  title={h.pasada ? "Ya pasó" : h.libre ? "" : "Ocupado"} onClick={() => elegirHora(h.texto)}>
                  {h.texto}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {hora && (
        <>
          <span className="sh-titulo mt-3">Duración</span>
          <div className="sh-grilla sh-duraciones">
            {duraciones.map((d) => (
              <button key={d} type="button" data-duracion={d} className={`sh-hora ${duracion === d ? "activa" : ""}`}
                onClick={() => onCambio({ hora, duracion: d })}>
                {textoDuracion(d)}
              </button>
            ))}
          </div>
          <p className="sh-resumen">
            {aFecha(dia).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })} · <strong>{hora} – {aHora(aMinutos(hora) + duracion)}</strong>
          </p>
        </>
      )}
      <div className="sh-leyenda"><span className="sh-hora muestra" /> Libre <span className="sh-hora muestra ocupada" /> Ocupado</div>
    </div>
  );
}
