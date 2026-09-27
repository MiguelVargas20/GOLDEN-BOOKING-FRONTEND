import { useCallback, useEffect, useState } from "react";
import { Form, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import { BsFileEarmarkExcel, BsFileEarmarkPdf, BsArrowRepeat } from "react-icons/bs";
import { obtenerReporte, descargarReporte } from "../api/ReporteApi";
import EstadoReservaBadge from "../../../shared/components/reservas/EstadoReservaBadge";
import { aTextoFecha } from "../../../shared/utils/fechas";
import { fecha, fechaHora, pesos } from "../../../shared/utils/formato";
import "../../../shared/styles/PanelAdmin.css";
import "../../../shared/styles/BotonesCompartidos.css";
import "../styles/Reportes.css";

const MAXIMO_FILAS = 100;

/** Rangos rápidos: [desde, hasta] como "yyyy-MM-dd". */
const RANGOS = {
  "Este mes": () => { const h = new Date(); return [aTextoFecha(new Date(h.getFullYear(), h.getMonth(), 1)), aTextoFecha(h)]; },
  "Mes anterior": () => {
    const h = new Date();
    return [aTextoFecha(new Date(h.getFullYear(), h.getMonth() - 1, 1)), aTextoFecha(new Date(h.getFullYear(), h.getMonth(), 0))];
  },
  "Últimos 30 días": () => { const h = new Date(); const d = new Date(h); d.setDate(h.getDate() - 29); return [aTextoFecha(d), aTextoFecha(h)]; },
  "Este año": () => { const h = new Date(); return [aTextoFecha(new Date(h.getFullYear(), 0, 1)), aTextoFecha(h)]; },
};

/**
 * Reportes (ADMIN): reservas e ingresos por rango de fechas, con vista previa
 * y descarga en Excel o PDF. Una reserva entra al rango por su fecha de
 * inicio (deporte) o de check-in (hotel); los ingresos cuentan solo las
 * confirmadas y finalizadas.
 */
export default function Reportes() {
  const [[desde, hasta], setRango] = useState(RANGOS["Este mes"]);
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [descargando, setDescargando] = useState(null);
  const [error, setError] = useState(null);

  const generar = useCallback(async (d = desde, h = hasta) => {
    setError(null);
    if (!d || !h) return setError("Elige la fecha inicial y la final.");
    if (h < d) return setError("La fecha final no puede ser anterior a la inicial.");
    setCargando(true);
    try {
      setReporte(await obtenerReporte(d, h));
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [desde, hasta]);

  // Primera carga: el mes actual
  useEffect(() => { generar(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const elegirRango = (nombre) => {
    const nuevo = RANGOS[nombre]();
    setRango(nuevo);
    generar(...nuevo);
  };

  const descargar = async (formato) => {
    setDescargando(formato);
    try {
      await descargarReporte(formato, reporte.desde, reporte.hasta);
    } catch (err) {
      Swal.fire({ title: "No se pudo descargar", text: err.message, icon: "error", confirmButtonColor: "#f38d1e" });
    } finally {
      setDescargando(null);
    }
  };

  const r = reporte?.resumen;

  return (
    <div className="gb-panel">
      <div className="gb-panel-header">
        <div>
          <h1 className="gb-panel-titulo">Reportes de <span>reservas</span></h1>
          <p className="gb-panel-subtitulo">Reservas e ingresos por rango de fechas. Descárgalos en Excel o PDF.</p>
        </div>
        {reporte && (
          <div className="gb-panel-acciones">
            <button type="button" className="btn-gb btn-gb-neutral btn-gb-sm" onClick={() => descargar("excel")} disabled={!!descargando}>
              {descargando === "excel" ? <Spinner size="sm" /> : <BsFileEarmarkExcel />} Descargar Excel
            </button>
            <button type="button" className="btn-gb btn-gb-neutral btn-gb-sm" onClick={() => descargar("pdf")} disabled={!!descargando}>
              {descargando === "pdf" ? <Spinner size="sm" /> : <BsFileEarmarkPdf />} Descargar PDF
            </button>
          </div>
        )}
      </div>

      <Form className="gb-tarjeta rp-filtros gb-form" onSubmit={(e) => { e.preventDefault(); generar(); }}>
        <div className="rp-campo">
          <Form.Label htmlFor="rp-desde">Desde</Form.Label>
          <Form.Control id="rp-desde" type="date" value={desde} max={hasta || undefined}
            onChange={(e) => setRango([e.target.value, hasta])} />
        </div>
        <div className="rp-campo">
          <Form.Label htmlFor="rp-hasta">Hasta</Form.Label>
          <Form.Control id="rp-hasta" type="date" value={hasta} min={desde || undefined}
            onChange={(e) => setRango([desde, e.target.value])} />
        </div>
        <button type="submit" className="btn-gb btn-gb-primary" disabled={cargando}>
          {cargando ? <Spinner size="sm" /> : <BsArrowRepeat />} Generar reporte
        </button>
        <div className="gb-chips rp-rapidos">
          {Object.keys(RANGOS).map((nombre) => (
            <button key={nombre} type="button" className="gb-chip" onClick={() => elegirRango(nombre)}>{nombre}</button>
          ))}
        </div>
      </Form>

      {error && <div className="alert alert-danger">{error}</div>}

      {r && (
        <>
          <div className="rp-kpis">
            <div className="rp-kpi"><span>Reservas</span><strong>{r.totalReservas}</strong><small>{r.reservasDeporte} deportivas · {r.reservasHotel} hoteleras</small></div>
            <div className="rp-kpi destacado"><span>Ingresos</span><strong>{pesos(r.ingresos)}</strong><small>Confirmadas y finalizadas</small></div>
            <div className="rp-kpi"><span>Ingresos deportes</span><strong>{pesos(r.ingresosDeporte)}</strong></div>
            <div className="rp-kpi"><span>Ingresos hotel</span><strong>{pesos(r.ingresosHotel)}</strong></div>
            <div className="rp-kpi"><span>Canceladas</span><strong>{r.porEstado?.CANCELADA ?? 0}</strong><small>{r.porEstado?.PENDIENTE ?? 0} pendientes</small></div>
          </div>

          <div className="gb-tabla-contenedor">
            <table className="gb-tabla">
              <thead>
                <tr><th>Tipo</th><th>Cliente</th><th>Lugar</th><th>Fecha</th><th>Estado</th><th>Total</th></tr>
              </thead>
              <tbody>
                {reporte.filas.length === 0 ? (
                  <tr><td colSpan={6} className="gb-tabla-vacia">No hay reservas entre el {fecha(reporte.desde)} y el {fecha(reporte.hasta)}.</td></tr>
                ) : reporte.filas.slice(0, MAXIMO_FILAS).map((f) => (
                  <tr key={`${f.categoria}-${f.idReserva}`}>
                    <td>{f.categoria === "HOTEL" ? "Hotel" : "Deporte"}</td>
                    <td>
                      <span className="gb-celda-principal">{f.cliente}</span>
                      <span className="gb-celda-secundaria">Doc. {f.documento}</span>
                    </td>
                    <td>{f.lugar}</td>
                    <td>{f.categoria === "HOTEL" ? `${fecha(f.inicio)} → ${fecha(f.fin)}` : fechaHora(f.inicio)}</td>
                    <td><EstadoReservaBadge estado={f.estado} /></td>
                    <td className="gb-celda-principal">{pesos(f.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {reporte.filas.length > MAXIMO_FILAS && (
            <p className="gb-ayuda mt-2">Mostrando {MAXIMO_FILAS} de {reporte.filas.length} reservas. Descarga el Excel para verlas todas.</p>
          )}
        </>
      )}
    </div>
  );
}
