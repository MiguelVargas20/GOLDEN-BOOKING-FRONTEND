import { useCallback, useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import EstadoReservaBadge from "./EstadoReservaBadge";
import { cancelarReserva } from "./dialogosReserva";
import "../../styles/PanelAdmin.css";
import "../../styles/BotonesCompartidos.css";

const MENSAJE_ESTADO = {
  PENDIENTE: "Esperando aprobación",
  CONFIRMADA: "Aprobada",
  FINALIZADA: "Completada",
};

/**
 * "Mis reservas" del cliente (hotel y deporte). Muestra el estado de cada
 * reserva, el motivo si la canceló la administración y permite cancelar las
 * que están pendientes o confirmadas (el backend exige 24 h de anticipación).
 */
export default function ListaMisReservas({
  titulo, resaltado, cargar, cancelar, obtenerId, columnas, detalles, textoVacio, accionesExtra,
}) {
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const obtener = useCallback(async () => {
    setError(null);
    try {
      setReservas(await cargar());
    } catch (err) {
      setError(err.message || "No se pudieron cargar tus reservas.");
    } finally {
      setCargando(false);
    }
  }, [cargar]);

  useEffect(() => { obtener(); }, [obtener]);

  const handleCancelar = async (reserva) => {
    const cancelada = await cancelarReserva(detalles(reserva), (motivo) => cancelar(obtenerId(reserva), motivo), false);
    if (cancelada) obtener();
  };

  const pendientes = reservas.filter((r) => r.estado === "PENDIENTE").length;

  return (
    <div className="gb-panel">
      <div className="gb-panel-header">
        <div>
          <h1 className="gb-panel-titulo">{titulo} <span>{resaltado}</span></h1>
          <p className="gb-panel-subtitulo">
            {pendientes > 0
              ? `Tienes ${pendientes} ${pendientes === 1 ? "solicitud pendiente" : "solicitudes pendientes"} de aprobación. Te avisaremos por correo.`
              : "Aquí ves el estado de todas tus reservas."}
          </p>
        </div>
        {accionesExtra && <div className="gb-panel-acciones">{accionesExtra}</div>}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {cargando ? (
        <div className="text-center py-5"><Spinner animation="border" style={{ color: "#f38d1e" }} /></div>
      ) : reservas.length === 0 ? (
        <div className="gb-tabla-contenedor"><p className="gb-tabla-vacia m-0">{textoVacio}</p></div>
      ) : (
        <div className="gb-tabla-contenedor">
          <table className="gb-tabla">
            <thead>
              <tr>
                {columnas.map((c) => <th key={c.titulo}>{c.titulo}</th>)}
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((r) => {
                const cancelable = r.estado === "PENDIENTE" || r.estado === "CONFIRMADA";
                return (
                  <tr key={obtenerId(r)}>
                    {columnas.map((c) => <td key={c.titulo}>{c.render(r)}</td>)}
                    <td>
                      <EstadoReservaBadge estado={r.estado} />
                      {MENSAJE_ESTADO[r.estado] && <span className="gb-celda-secundaria">{MENSAJE_ESTADO[r.estado]}</span>}
                      {r.estado === "CANCELADA" && (
                        <span className="gb-celda-motivo">
                          {r.canceladaPor === "ADMINISTRADOR"
                            ? `Cancelada por la administración${r.motivoCancelacion ? `: ${r.motivoCancelacion}` : ""}`
                            : r.canceladaPor === "SISTEMA"
                              ? "Venció: no alcanzó a ser aprobada antes de la fecha"
                              : "Cancelada por ti"}
                        </span>
                      )}
                    </td>
                    <td>
                      {cancelable ? (
                        <button type="button" className="btn-gb btn-gb-danger btn-gb-sm" onClick={() => handleCancelar(r)}>
                          Cancelar
                        </button>
                      ) : (
                        <span className="gb-celda-secundaria">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
