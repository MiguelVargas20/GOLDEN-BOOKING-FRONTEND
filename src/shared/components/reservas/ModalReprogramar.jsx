import { useEffect, useMemo, useState } from "react";
import { Modal, Row, Col, Form, Spinner } from "react-bootstrap";
import { listarEspacios } from "../../../modules/reservasDeportivas/api/EspacioDeportivoApi";
import { aTextoFecha, nochesEntre } from "../../utils/fechas";
import { pesos } from "../../utils/formato";

const HOY = aTextoFecha(new Date());
const pad = (n) => String(n).padStart(2, "0");
const aMinutos = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
const aHora = (min) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;
/** "2026-10-15T10:00:00" → { dia: "2026-10-15", hora: "10:00" } */
const partir = (valor) => ({ dia: valor?.slice(0, 10) || "", hora: valor?.slice(11, 16) || "" });

/**
 * Cambiar la fecha de una reserva sin cancelarla.
 *  - Deporte: día, hora de entrada y duración (dentro del horario del espacio).
 *  - Hotel: días de check-in y check-out.
 * Las reglas finales (cruces, 24 h, horario) las valida el backend.
 *
 * @param {{ tipo: "DEPORTE"|"HOTEL", id, lugar, inicio, fin, espacioId?, precioNoche? }} reserva
 * @param {(inicio: string, fin: string) => Promise} onGuardar - recibe las fechas ya armadas
 */
export default function ModalReprogramar({ reserva, onCerrar, onGuardar }) {
  const esDeporte = reserva?.tipo === "DEPORTE";
  const [espacio, setEspacio] = useState(null);
  const [dia, setDia] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
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
      setHoraInicio(ini.hora);
      setDuracion(Math.max(60, aMinutos(partir(reserva.fin).hora) - aMinutos(ini.hora)));
      listarEspacios()
        .then((lista) => setEspacio(lista.find((e) => e.id === reserva.espacioId) || null))
        .catch(() => setEspacio(null));
    } else {
      setCheckIn(partir(reserva.inicio).dia);
      setCheckOut(partir(reserva.fin).dia);
    }
  }, [reserva, esDeporte]);

  // Horas de entrada cada 30 min, dejando al menos 1 h antes del cierre
  const apertura = espacio?.horaApertura ? aMinutos(espacio.horaApertura.slice(0, 5)) : 6 * 60;
  const cierre = espacio?.horaCierre ? aMinutos(espacio.horaCierre.slice(0, 5)) : 22 * 60;
  const horas = useMemo(() => {
    const lista = [];
    for (let m = apertura; m + 60 <= cierre; m += 30) lista.push(aHora(m));
    return lista;
  }, [apertura, cierre]);
  const duraciones = useMemo(() => {
    if (!horaInicio) return [60];
    const lista = [];
    for (let d = 60; aMinutos(horaInicio) + d <= cierre; d += 30) lista.push(d);
    return lista.length ? lista : [60];
  }, [horaInicio, cierre]);

  if (!reserva) return null;

  const noches = checkIn && checkOut ? nochesEntre(checkIn, checkOut) : 0;
  const total = esDeporte
    ? (espacio?.tarifaHora ? Math.round((duracion / 60) * espacio.tarifaHora) : null)
    : (reserva.precioNoche && noches > 0 ? noches * reserva.precioNoche : null);

  const guardar = async (e) => {
    e.preventDefault();
    setError(null);
    let inicio;
    let fin;
    if (esDeporte) {
      if (!dia || !horaInicio) return setError("Elige el día y la hora de entrada.");
      inicio = `${dia}T${horaInicio}:00`;
      fin = `${dia}T${aHora(aMinutos(horaInicio) + duracion)}:00`;
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
    <Modal show onHide={onCerrar} centered>
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
            <Row className="g-3">
              <Col xs={12}>
                <Form.Label htmlFor="rp-dia">Día</Form.Label>
                <Form.Control id="rp-dia" type="date" min={HOY} value={dia} onChange={(e) => setDia(e.target.value)} required />
              </Col>
              <Col xs={6}>
                <Form.Label htmlFor="rp-hora">Entrada</Form.Label>
                <Form.Select id="rp-hora" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} required>
                  {!horas.includes(horaInicio) && <option value="">Elige…</option>}
                  {horas.map((h) => <option key={h} value={h}>{h}</option>)}
                </Form.Select>
              </Col>
              <Col xs={6}>
                <Form.Label htmlFor="rp-duracion">Duración</Form.Label>
                <Form.Select id="rp-duracion" value={duracion} onChange={(e) => setDuracion(Number(e.target.value))}>
                  {duraciones.map((d) => <option key={d} value={d}>{d % 60 ? `${Math.floor(d / 60)} h 30 min` : `${d / 60} h`}</option>)}
                </Form.Select>
              </Col>
            </Row>
          ) : (
            <Row className="g-3">
              <Col xs={6}>
                <Form.Label htmlFor="rp-checkin">Check-in</Form.Label>
                <Form.Control id="rp-checkin" type="date" min={HOY} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required />
              </Col>
              <Col xs={6}>
                <Form.Label htmlFor="rp-checkout">Check-out</Form.Label>
                <Form.Control id="rp-checkout" type="date" min={checkIn || HOY} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required />
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
