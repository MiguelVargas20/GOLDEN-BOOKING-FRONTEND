import { useCallback, useEffect, useMemo, useState } from "react";
import { Spinner } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { obtenerCalendarioSemana } from "../api/CalendarioApi";
import { aFecha, aTextoFecha } from "../../../shared/utils/fechas";
import { hora } from "../../../shared/utils/formato";
import "../../../shared/styles/PanelAdmin.css";
import "../../../shared/styles/BotonesCompartidos.css";
import "../../../shared/styles/Catalogo.css";
import "../styles/Calendario.css";

const DIA_SEMANA = new Intl.DateTimeFormat("es-CO", { weekday: "short" });
const DIA_MES = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short" });
const ESTADOS = { PENDIENTE: "Pendiente", CONFIRMADA: "Confirmada", FINALIZADA: "Finalizada" };

/** Lunes de la semana de la fecha dada. */
const lunesDe = (d) => {
  const f = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  f.setDate(f.getDate() - ((f.getDay() + 6) % 7));
  return f;
};
const sumarDias = (d, n) => { const f = new Date(d); f.setDate(f.getDate() + n); return f; };
const soloDia = (valor) => aTextoFecha(aFecha(valor));
/** "Laura Pérez" → "Laura P." (cabe en la celda) */
const corto = (nombre) => { const [n, a] = (nombre || "").split(" "); return a ? `${n} ${a[0]}.` : n; };

/**
 * Calendario de ocupación (ADMIN): una semana por habitación (noches
 * ocupadas) o por espacio deportivo (horarios reservados de cada día).
 */
export default function CalendarioOcupacion() {
  const [lunes, setLunes] = useState(() => lunesDe(new Date()));
  const [vista, setVista] = useState("habitaciones");
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      setDatos(await obtenerCalendarioSemana(aTextoFecha(lunes)));
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [lunes]);

  useEffect(() => { cargar(); }, [cargar]);

  const dias = useMemo(() => Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i)), [lunes]);
  const hoy = aTextoFecha(new Date());
  const filas = datos ? (vista === "habitaciones" ? datos.habitaciones : datos.espacios) : [];

  /** Reservas que ocupan ese día: noches de hotel (entrada ≤ día < salida) u horarios de deporte. */
  const reservasDelDia = (fila, dia) => {
    const d = aTextoFecha(dia);
    return fila.reservas.filter((r) => (vista === "habitaciones"
      ? soloDia(r.inicio) <= d && d < soloDia(r.fin)
      : soloDia(r.inicio) === d));
  };

  const ocupacion = (fila) => dias.filter((dia) => reservasDelDia(fila, dia).length > 0).length;

  return (
    <div className="gb-panel">
      <div className="gb-panel-header">
        <div>
          <h1 className="gb-panel-titulo">Calendario de <span>ocupación</span></h1>
          <p className="gb-panel-subtitulo">Semana del {DIA_MES.format(dias[0])} al {DIA_MES.format(dias[6])} de {dias[6].getFullYear()}.</p>
        </div>
        <div className="gb-panel-acciones">
          <button type="button" className="btn-gb btn-gb-neutral btn-gb-sm" onClick={() => setLunes((l) => sumarDias(l, -7))} aria-label="Semana anterior">
            <BsChevronLeft /> Anterior
          </button>
          <button type="button" className="btn-gb btn-gb-secondary btn-gb-sm" onClick={() => setLunes(lunesDe(new Date()))}>Hoy</button>
          <button type="button" className="btn-gb btn-gb-neutral btn-gb-sm" onClick={() => setLunes((l) => sumarDias(l, 7))} aria-label="Semana siguiente">
            Siguiente <BsChevronRight />
          </button>
        </div>
      </div>

      <div className="cal-barra">
        <div className="gb-chips m-0">
          <button type="button" className={`gb-chip ${vista === "habitaciones" ? "activo" : ""}`} onClick={() => setVista("habitaciones")}>
            Habitaciones {datos && <span>{datos.habitaciones.length}</span>}
          </button>
          <button type="button" className={`gb-chip ${vista === "espacios" ? "activo" : ""}`} onClick={() => setVista("espacios")}>
            Espacios deportivos {datos && <span>{datos.espacios.length}</span>}
          </button>
        </div>
        <div className="cal-leyenda">
          {Object.entries(ESTADOS).map(([valor, texto]) => <span key={valor} className={`cal-bloque cal-${valor.toLowerCase()}`}>{texto}</span>)}
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="gb-tabla-contenedor">
        <table className="gb-tabla cal-tabla">
          <thead>
            <tr>
              <th>{vista === "habitaciones" ? "Habitación" : "Espacio"}</th>
              {dias.map((d) => (
                <th key={d.getTime()} className={aTextoFecha(d) === hoy ? "cal-hoy" : ""}>
                  <span className="cal-dia">{DIA_SEMANA.format(d)}</span>
                  <span className="cal-fecha">{DIA_MES.format(d)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cargando && !datos ? (
              <tr><td colSpan={8} className="gb-tabla-vacia"><Spinner size="sm" /> Cargando…</td></tr>
            ) : filas.length === 0 ? (
              <tr><td colSpan={8} className="gb-tabla-vacia">No hay {vista === "habitaciones" ? "habitaciones" : "espacios"} registrados.</td></tr>
            ) : filas.map((fila) => (
              <tr key={fila.id}>
                <th scope="row" className="cal-recurso">
                  <span className="gb-celda-principal">{fila.nombre}</span>
                  <span className="gb-celda-secundaria">
                    {[fila.detalle, fila.estado === "MANTENIMIENTO" ? "En mantenimiento" : null].filter(Boolean).join(" · ") || "—"}
                  </span>
                  <span className="cal-ocupacion">{ocupacion(fila)}/7 días ocupados</span>
                </th>
                {dias.map((dia) => {
                  const reservas = reservasDelDia(fila, dia);
                  return (
                    <td key={dia.getTime()} className={`cal-celda ${aTextoFecha(dia) === hoy ? "cal-hoy" : ""}`}>
                      {reservas.map((r) => (
                        <span key={r.idReserva} className={`cal-bloque cal-${r.estado.toLowerCase()}`}
                          title={`${r.cliente} · ${ESTADOS[r.estado] || r.estado}`}>
                          {vista === "espacios" && <strong>{hora(r.inicio)}–{hora(r.fin)}</strong>}
                          {vista === "habitaciones" && soloDia(r.inicio) === aTextoFecha(dia) && <strong>Entra</strong>}
                          {corto(r.cliente)}
                        </span>
                      ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
