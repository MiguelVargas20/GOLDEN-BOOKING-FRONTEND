import { useState } from "react";
import { useAncho } from "../hooks/useAncho";
import { diaCorto, diaLargo } from "../utils/fechas";

const ALTO = 240;
const MARGEN = { arriba: 12, derecha: 8, abajo: 28, izquierda: 32 };
const RADIO = 4;   // extremo redondeado de la barra (solo arriba)
const SEPARACION = 2; // espacio entre segmentos apilados

const SERIES = [
  { clave: "deporte", nombre: "Deportivas", clase: "db-serie-deporte" },
  { clave: "hotel", nombre: "Hoteleras", clase: "db-serie-hotel" },
];

/** Escala "bonita" para el eje Y: 0 … máximo redondeado en 4 pasos. */
function escalaY(maximo) {
  if (maximo <= 4) return { tope: 4, pasos: [0, 1, 2, 3, 4] };
  const crudo = maximo / 4;
  const potencia = 10 ** Math.floor(Math.log10(crudo));
  const paso = [1, 2, 2.5, 5, 10].map((f) => f * potencia).find((p) => p >= crudo);
  return { tope: paso * 4, pasos: [0, 1, 2, 3, 4].map((i) => i * paso) };
}

/** Rectángulo con solo las esquinas de arriba redondeadas (anclado a la base). */
function rectArribaRedondeado(x, y, ancho, alto, r) {
  const radio = Math.min(r, ancho / 2, alto);
  return `M${x},${y + alto} V${y + radio} Q${x},${y} ${x + radio},${y} H${x + ancho - radio} Q${x + ancho},${y} ${x + ancho},${y + radio} V${y + alto} Z`;
}

/**
 * Reservas recibidas por día (columnas apiladas: deportivas + hoteleras).
 * Leyenda clicable para ocultar una serie, tooltip al pasar el mouse y vista
 * de tabla para quien no pueda leer el gráfico.
 */
export default function GraficoTendencia({ puntos }) {
  const [ref, ancho] = useAncho();
  const [activo, setActivo] = useState(null);
  const [ocultas, setOcultas] = useState({});
  const [verTabla, setVerTabla] = useState(false);

  const visibles = SERIES.filter((s) => !ocultas[s.clave]);
  const totales = puntos.map((p) => visibles.reduce((suma, s) => suma + p[s.clave], 0));
  const { tope, pasos } = escalaY(Math.max(0, ...totales));

  const anchoUtil = ancho - MARGEN.izquierda - MARGEN.derecha;
  const altoUtil = ALTO - MARGEN.arriba - MARGEN.abajo;
  const banda = anchoUtil / Math.max(1, puntos.length);
  const anchoBarra = Math.max(4, Math.min(28, banda * 0.62));
  const y = (v) => MARGEN.arriba + altoUtil - (v / tope) * altoUtil;
  // Etiquetas del eje X sin que se amontonen
  const cadaCuanto = Math.ceil(puntos.length / Math.max(2, Math.floor(anchoUtil / 64)));

  const alternar = (clave) => setOcultas((o) => {
    const siguiente = { ...o, [clave]: !o[clave] };
    // siempre queda al menos una serie visible
    return SERIES.every((s) => siguiente[s.clave]) ? o : siguiente;
  });

  const punto = activo != null ? puntos[activo] : null;
  const totalPeriodo = puntos.reduce((s, p) => s + p.deporte + p.hotel, 0);

  return (
    <div className="db-grafico">
      <div className="db-grafico-barra">
        <div className="db-leyenda" role="group" aria-label="Series">
          {SERIES.map((s) => (
            <button
              key={s.clave}
              type="button"
              className={`db-leyenda-item ${ocultas[s.clave] ? "apagada" : ""}`}
              onClick={() => alternar(s.clave)}
              aria-pressed={!ocultas[s.clave]}
            >
              <span className={`db-muestra ${s.clase}`} /> {s.nombre}
            </button>
          ))}
        </div>
        <button type="button" className="db-enlace" onClick={() => setVerTabla((v) => !v)}>
          {verTabla ? "Ver gráfico" : "Ver tabla"}
        </button>
      </div>

      {verTabla ? (
        <div className="db-tabla-scroll">
          <table className="db-tabla">
            <thead><tr><th>Día</th><th>Deportivas</th><th>Hoteleras</th><th>Total</th></tr></thead>
            <tbody>
              {puntos.map((p) => (
                <tr key={p.fecha}><td>{diaCorto(p.fecha)}</td><td>{p.deporte}</td><td>{p.hotel}</td><td>{p.deporte + p.hotel}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="db-lienzo" ref={ref} onMouseLeave={() => setActivo(null)}>
          {totalPeriodo === 0 && <div className="db-lienzo-vacio">Aún no hay reservas en este periodo.</div>}
          <svg width={ancho} height={ALTO} role="img" aria-label={`Reservas por día: ${totalPeriodo} en el periodo`}>
            {/* Cuadrícula y eje Y (recesivos) */}
            {pasos.map((v) => (
              <g key={v}>
                <line className="db-rejilla" x1={MARGEN.izquierda} x2={ancho - MARGEN.derecha} y1={y(v)} y2={y(v)} />
                <text className="db-eje" x={MARGEN.izquierda - 8} y={y(v)} dy="0.32em" textAnchor="end">{v}</text>
              </g>
            ))}

            {puntos.map((p, i) => {
              const x = MARGEN.izquierda + i * banda + (banda - anchoBarra) / 2;
              let base = 0;
              const segmentos = visibles.filter((s) => p[s.clave] > 0);
              return (
                <g key={p.fecha} className={`db-columna ${activo === i ? "activa" : ""} ${activo != null && activo !== i ? "atenuada" : ""}`}
                  style={{ "--retraso": `${i * 18}ms` }}>
                  {segmentos.map((s, j) => {
                    const valor = p[s.clave];
                    const yArriba = y(base + valor);
                    const yAbajo = y(base) - (j > 0 ? SEPARACION : 0);
                    base += valor;
                    const alto = Math.max(1, yAbajo - yArriba);
                    const esUltimo = j === segmentos.length - 1;
                    return esUltimo
                      ? <path key={s.clave} className={`db-barra ${s.clase}`} d={rectArribaRedondeado(x, yArriba, anchoBarra, alto, RADIO)} />
                      : <rect key={s.clave} className={`db-barra ${s.clase}`} x={x} y={yArriba} width={anchoBarra} height={alto} />;
                  })}
                  {i % cadaCuanto === 0 && (
                    <text className="db-eje" x={x + anchoBarra / 2} y={ALTO - 8} textAnchor="middle">{diaCorto(p.fecha)}</text>
                  )}
                  {/* Zona sensible: toda la banda del día, más grande que la barra */}
                  <rect className="db-zona" x={MARGEN.izquierda + i * banda} y={MARGEN.arriba} width={banda} height={altoUtil}
                    onMouseEnter={() => setActivo(i)} onFocus={() => setActivo(i)} onBlur={() => setActivo(null)}
                    tabIndex={0} aria-label={`${diaLargo(p.fecha)}: ${p.deporte} deportivas, ${p.hotel} hoteleras`} />
                </g>
              );
            })}
            <line className="db-base" x1={MARGEN.izquierda} x2={ancho - MARGEN.derecha} y1={y(0)} y2={y(0)} />
          </svg>

          {punto && (
            <div
              className="db-tooltip"
              style={{
                left: Math.min(ancho - 170, Math.max(0, MARGEN.izquierda + activo * banda + banda / 2 - 85)),
                top: Math.max(0, y(totales[activo]) - 96),
              }}
            >
              <strong>{diaLargo(punto.fecha)}</strong>
              {visibles.map((s) => (
                <div key={s.clave} className="db-tooltip-fila">
                  <span><span className={`db-muestra ${s.clase}`} /> {s.nombre}</span>
                  <b>{punto[s.clave]}</b>
                </div>
              ))}
              <div className="db-tooltip-fila total"><span>Total</span><b>{totales[activo]}</b></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
