import { useEffect, useMemo, useState } from "react";
import { Modal, Row, Col, Form, Spinner } from "react-bootstrap";
import { listarEspacios } from "../../../modules/reservasDeportivas/api/EspacioDeportivoApi";
import { useReservasDeporte } from "../../../modules/reservasDeportivas/hooks/useReservasDeporte";
import CampoFecha from "../fechas/CampoFecha";
import SelectorHorario from "../fechas/SelectorHorario";
import { aFecha, aTextoFecha, nochesEntre } from "../../utils/fechas";
import { aHora, aMinutos } from "../../utils/horas";
import { pesos } from "../../utils/formato";

const HOY = aTextoFecha(new Date());
/** "2026-10-15T10:00:00" → { dia: "2026-10-15", hora: "10:00" } */
const partir = (valor) => ({ dia: valor?.slice(0, 10) || "", hora: valor?.slice(11, 16) || "" });
const diaSiguiente = (dia) => { const d = aFecha(dia); d.setDate(d.getDate() + 1); return aTextoFecha(d); };

/**
 * Cambiar la fecha de una reserva sin cancelarla, con el mismo calendario y
 * selector de horas que al reservar.
 *  - Deporte: día, hora de entrada y duración (dentro del horario del espacio).
 *  - Hotel: días de check-in y check-out.
 * Las reglas finales (cruces, 24 h, anticipación) las valida el backend.
 *
 * @param {{ tipo: "DEPORTE"|"HOTEL", id, lugar, inicio, fin, espacioId?, precioNoche?, descuento? }} reserva
 * @param {(inicio: string, fin: string) => Promise} onGuardar
 */
export default function ModalReprogramar({ reserva, onCerrar, onGuardar }) {
  const esDeporte = reserva?.tipo === "DEPORTE";
  const { ocupadosDelDia } = useReservasDeporte();
  const [espacio, setEspacio] = useState(null);
  const [dia, setDia] = useState("");
  const [hora, setHora] = useState("");
  const [duracion, setDuracion] = useState(60);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Valores iniciales: las fechas actuales de la reserva
  useEffect(() => {
    if (!reserva) return;
    setError(null);
    if (esDeporte) {
      const ini = partir(reserva.inicio);
      setDia(ini.dia < HOY ? HOY : ini.dia);
      setHora(ini.hora);
      setDuracion(Math.max(60, aMinutos(partir(reserva.fin).hora) - aMinutos(ini.hora)));
      listarEspacios()
        .then((lista) => setEspacio(lista.find((e) => e.id === reserva.espacioId) || null))
        .catch(() => setEspacio(null));
    } else {
      setCheckIn(partir(reserva.inicio).dia);
      setCheckOut(partir(reserva.fin).dia);
    }
  }, [reserva, esDeporte]);

  // Horarios ocupados del día, sin contar el de esta misma reserva
  const ocupados = useMemo(() => {
    if (!esDeporte || !dia || !reserva) return [];
    const propio = new Date(reserva.inicio).getTime();
    return ocupadosDelDia(reserva.espacioId, aFecha(dia)).filter((o) => o.inicio.getTime() !== propio);
  }, [esDeporte, dia, reserva, ocupadosDelDia]);

  if (!reserva) return null;

  const noches = checkIn && checkOut ? nochesEntre(checkIn, checkOut) : 0;
  const factor = 1 - (reserva.descuento || 0) / 100;
  const total = esDeporte
    ? (espacio?.tarifaHora && hora ? Math.round((duracion / 60) * espacio.tarifaHora * factor) : null)
    : (reserva.precioNoche && noches > 0 ? Math.round(noches * reserva.precioNoche * factor) : null);

  const guardar = async (e) => {
    e.preventDefault();
    setError(null);
    let inicio;
    let fin;
    if (esDeporte) {
      if (!dia || !hora) return setError("Elige el día y la hora de entrada.");
      inicio = `${dia}T${hora}:00`;
      fin = `${dia}T${aHora(aMinutos(hora) + duracion)}:00`;
    } else {
      if (!checkIn || !checkOut) return setError("Elige el check-in y el check-out.");
      if (noches <= 0) return setError("El check-out debe ser posterior al check-in.");
      inicio = checkIn;
      fin = checkOut;
    }
    setGuardando(true);
    try {
      await onGuardar(inicio, fin);
    } catch (err) {
      setError(err.message || "No se pudo reprogramar la reserva.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal show onHide={onCerrar} centered size={esDeporte ? "lg" : undefined}>
      <Form onSubmit={guardar} className="gb-form">
        <Modal.Header closeButton>
          <Modal.Title>Cambiar fecha</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="gb-ayuda mb-3">
            {reserva.lugar}. Si la reserva ya estaba aprobada, el nuevo horario debe aprobarlo la administración.
          </p>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          {esDeporte ? (
            <div className="d-grid gap-3">
              <div>
                <Form.Label htmlFor="rp-dia">Día</Form.Label>
                <CampoFecha id="rp-dia" valor={dia} min={HOY} onCambio={(d) => { setDia(d); setHora(""); }} />
              </div>
              <SelectorHorario espacio={espacio} dia={dia} ocupados={ocupados} hora={hora} duracion={duracion}
                onCambio={({ hora: h, duracion: d }) => { setHora(h); setDuracion(d); }} />
            </div>
          ) : (
            <Row className="g-3">
              <Col xs={6}>
                <Form.Label htmlFor="rp-checkin">Check-in</Form.Label>
                <CampoFecha id="rp-checkin" valor={checkIn} min={HOY}
                  onCambio={(d) => { setCheckIn(d); if (d && checkOut && checkOut <= d) setCheckOut(""); }} />
              </Col>
              <Col xs={6}>
                <Form.Label htmlFor="rp-checkout">Check-out</Form.Label>
                <CampoFecha id="rp-checkout" valor={checkOut} min={checkIn ? diaSiguiente(checkIn) : HOY} onCambio={setCheckOut} />
              </Col>
            </Row>
          )}
          <div className="rp-total mt-3">
            <span>{esDeporte ? "Nuevo total estimado" : noches > 0 ? `${noches} ${noches === 1 ? "noche" : "noches"}` : "Total"}</span>
            <strong>{total !== null ? pesos(total) : "—"}</strong>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn-gb btn-gb-secondary" onClick={onCerrar} disabled={guardando}>Volver</button>
          <button type="submit" className="btn-gb btn-gb-primary" disabled={guardando}>
            {guardando ? <><Spinner size="sm" /> Guardando…</> : "Guardar nueva fecha"}
          </button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
