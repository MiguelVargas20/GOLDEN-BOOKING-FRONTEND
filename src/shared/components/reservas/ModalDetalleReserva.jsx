import { useState } from "react";
import { Modal, Spinner } from "react-bootstrap";
import { BsPencil, BsPeople } from "react-icons/bs";
import EstadoReservaBadge from "./EstadoReservaBadge";
import EditorMiembros from "./EditorMiembros";
import { TIPOS_DOC_MIEMBRO, limpiarMiembros, validarMiembros } from "../../utils/miembros";
import "./ModalDetalleReserva.css";

/**
 * Detalle de una reserva: datos principales, implementos, descuento y
 * acompañantes. Si la reserva sigue pendiente o confirmada y se pasa
 * onGuardarMiembros, se pueden editar los acompañantes.
 *
 * @param {Object} reserva - la reserva (con miembros, implAlquilados, descuento, estado)
 * @param {Object} filas - { etiqueta: valor } con lugar, fechas y total
 * @param {string} docTitular - documento del titular (no puede ser acompañante)
 * @param {(miembros) => Promise} [onGuardarMiembros]
 */
export default function ModalDetalleReserva({ titulo, reserva, filas, docTitular, onCerrar, onGuardarMiembros }) {
  const [editando, setEditando] = useState(false);
  const [miembros, setMiembros] = useState(() => (reserva.miembros || []).map((m) => ({ ...m })));
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const editable = onGuardarMiembros && (reserva.estado === "PENDIENTE" || reserva.estado === "CONFIRMADA");

  const guardar = async () => {
    const problema = validarMiembros(miembros, docTitular);
    if (problema) return setError(problema);
    setGuardando(true);
    setError(null);
    try {
      await onGuardarMiembros(limpiarMiembros(miembros));
      setEditando(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const actuales = reserva.miembros || [];

  return (
    <Modal show onHide={onCerrar} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{titulo}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="dr-estado"><EstadoReservaBadge estado={reserva.estado} /></div>
        <dl className="dr-datos">
          {Object.entries(filas).map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
          ))}
          {reserva.descuento > 0 && <div><dt>Descuento de socio</dt><dd>{reserva.descuento} %</dd></div>}
          {reserva.implAlquilados && <div><dt>Implementos</dt><dd>{reserva.implAlquilados}</dd></div>}
          {reserva.rqrEntrenador && <div><dt>Entrenador</dt><dd>Sí</dd></div>}
          <div><dt>Personas</dt><dd>{actuales.length + 1} (titular{actuales.length ? ` + ${actuales.length}` : ""})</dd></div>
        </dl>

        <div className="dr-miembros">
          <div className="dr-miembros-cabecera">
            <h3><BsPeople /> Acompañantes</h3>
            {editable && !editando && (
              <button type="button" className="btn-gb btn-gb-neutral btn-gb-sm" onClick={() => setEditando(true)}>
                <BsPencil /> Editar
              </button>
            )}
          </div>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          {editando ? (
            <>
              <EditorMiembros miembros={miembros} onCambio={setMiembros} deshabilitado={guardando} />
              <div className="d-flex gap-2 justify-content-end mt-3">
                <button type="button" className="btn-gb btn-gb-secondary btn-gb-sm" disabled={guardando}
                  onClick={() => { setEditando(false); setMiembros(actuales.map((m) => ({ ...m }))); setError(null); }}>
                  Cancelar
                </button>
                <button type="button" className="btn-gb btn-gb-primary btn-gb-sm" onClick={guardar} disabled={guardando}>
                  {guardando ? <Spinner size="sm" /> : "Guardar acompañantes"}
                </button>
              </div>
            </>
          ) : actuales.length === 0 ? (
            <p className="gb-ayuda m-0">Sin acompañantes registrados.</p>
          ) : (
            <table className="dr-tabla">
              <thead><tr><th>Nombre</th><th>Documento</th></tr></thead>
              <tbody>
                {actuales.map((m) => (
                  <tr key={m.numeroDocumento}>
                    <td>{m.nombre}</td>
                    <td>{TIPOS_DOC_MIEMBRO[m.tipoDocumento] || m.tipoDocumento} {m.numeroDocumento}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn-gb btn-gb-primary" onClick={onCerrar}>Cerrar</button>
      </Modal.Footer>
    </Modal>
  );
}
