import { useCallback, useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import { BsCalendar2Week, BsStar } from "react-icons/bs";
import EstadoReservaBadge from "./EstadoReservaBadge";
import ModalReprogramar from "./ModalReprogramar";
import { cancelarReserva } from "./dialogosReserva";
import { avisarReservasCambiaron } from "../../hooks/eventosReservas";
import ModalCalificar from "../../../modules/calificaciones/components/ModalCalificar";
import { Estrellas } from "../../../modules/calificaciones/components/Estrellas";
import { calificarReserva, listarMisCalificaciones } from "../../../modules/calificaciones/api/CalificacionApi";
import "../../styles/PanelAdmin.css";
import "../../styles/BotonesCompartidos.css";

const MENSAJE_ESTADO = {
  PENDIENTE: "Esperando aprobación",
  CONFIRMADA: "Aprobada",
  FINALIZADA: "Completada",
};

/**
 * "Mis reservas" del cliente (hotel y deporte). Muestra el estado de cada
 * reserva, el motivo si la canceló la administración y permite:
 *  - cancelar o cambiar la fecha de las pendientes o confirmadas (el backend
 *    exige 24 h de anticipación);
 *  - calificar las finalizadas (una vez).
 *
 * @param {"DEPORTE"|"HOTEL"} categoria
 * @param {Function} reprogramar(id, inicio, fin) - API para cambiar la fecha
 * @param {Function} datosReprogramacion(reserva) - { tipo, id, lugar, inicio, fin, espacioId?, precioNoche? }
 */
export default function ListaMisReservas({
  titulo, resaltado, categoria, cargar, cancelar, reprogramar, datosReprogramacion,
  obtenerId, columnas, detalles, textoVacio, accionesExtra,
}) {
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [calificaciones, setCalificaciones] = useState({});
  const [reprogramando, setReprogramando] = useState(null);
  const [calificando, setCalificando] = useState(null);

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

  // Qué reservas ya calificó el cliente (para mostrar sus estrellas en vez del botón)
  useEffect(() => {
    listarMisCalificaciones()
      .then((lista) => setCalificaciones(Object.fromEntries(lista.map((c) => [c.idReserva, c.puntuacion]))))
      .catch(() => setCalificaciones({}));
  }, []);

  const guardarReprogramacion = async (inicio, fin) => {
    await reprogramar(reprogramando.id, inicio, fin);
    setReprogramando(null);
    avisarReservasCambiaron();
    await Swal.fire({ title: "Fecha actualizada", text: "Te enviamos un correo con los nuevos datos.", icon: "success", timer: 2200, showConfirmButton: false });
    obtener();
  };

  const guardarCalificacion = async (puntuacion, comentario) => {
    const id = obtenerId(calificando);
    await calificarReserva(categoria, id, puntuacion, comentario);
    setCalificaciones((c) => ({ ...c, [id]: puntuacion }));
    setCalificando(null);
    Swal.fire({ title: "¡Gracias por calificar!", icon: "success", timer: 1800, showConfirmButton: false });
  };

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
                        <div className="gb-acciones-fila">
                          {reprogramar && (
                            <button type="button" className="btn-gb btn-gb-neutral btn-gb-sm"
                              onClick={() => setReprogramando(datosReprogramacion(r))}>
                              <BsCalendar2Week /> Cambiar fecha
                            </button>
                          )}
                          <button type="button" className="btn-gb btn-gb-danger btn-gb-sm" onClick={() => handleCancelar(r)}>
                            Cancelar
                          </button>
                        </div>
                      ) : r.estado === "FINALIZADA" && categoria ? (
                        calificaciones[obtenerId(r)]
                          ? <span className="gb-celda-secundaria">Tu calificación <Estrellas valor={calificaciones[obtenerId(r)]} /></span>
                          : (
                            <button type="button" className="btn-gb btn-gb-primary btn-gb-sm" onClick={() => setCalificando(r)}>
                              <BsStar /> Calificar
                            </button>
                          )
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

      {reprogramando && (
        <ModalReprogramar reserva={reprogramando} onCerrar={() => setReprogramando(null)} onGuardar={guardarReprogramacion} />
      )}
      {calificando && (
        <ModalCalificar lugar={datosReprogramacion ? datosReprogramacion(calificando).lugar : ""}
          onCerrar={() => setCalificando(null)} onGuardar={guardarCalificacion} />
      )}
    </div>
  );
}
