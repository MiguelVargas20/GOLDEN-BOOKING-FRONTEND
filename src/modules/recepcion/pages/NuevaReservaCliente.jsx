import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Form, Row, Col, Spinner, Alert } from "react-bootstrap";
import Swal from "sweetalert2";
import DatePicker, { registerLocale } from "react-datepicker";
import { es } from "date-fns/locale";
import { BiCalendarAlt } from "react-icons/bi";
import {
  BsSearch, BsPersonCheck, BsPersonX, BsTrophy, BsBuilding, BsCheck2Circle, BsArrowLeft,
} from "react-icons/bs";
import "react-datepicker/dist/react-datepicker.css";
import "../../../shared/styles/DatePickerCompartido.css";
import "../../../shared/styles/PanelAdmin.css";
import "../../../shared/styles/BotonesCompartidos.css";
import "../../reservasDeportivas/styles/ReservarEspacio.css"; // .re-ocupados, .re-total
import "../styles/NuevaReservaCliente.css";

import { obtenerUsuarioPorDocumento } from "../../usuarios/api/UserApi";
import { listarEspacios } from "../../reservasDeportivas/api/EspacioDeportivoApi";
import { crearReservaDeporte } from "../../reservasDeportivas/api/ReservaDeporteApi";
import { useReservasDeporte } from "../../reservasDeportivas/hooks/useReservasDeporte";
import {
  toLocalISOString, inicioValido, finValido, finSugerido, precioEstimado,
} from "../../reservasDeportivas/utils/horarioEspacio";
import { listarTodasLasHabitaciones } from "../../reservasHoteleras/api/HabitacionApi";
import { crearReservaHotel, obtenerFechasOcupadas } from "../../reservasHoteleras/api/ReservaHotelApi";
import { haySolapamiento } from "../../reservasHoteleras/utils/fechasHotel";
import { pesos, hora, fecha } from "../../../shared/utils/formato";
import { escapeHtml } from "../../../shared/utils/escapeHtml";

registerLocale("es", es);

const UN_DIA_MS = 24 * 60 * 60 * 1000;

/** Medianoche local del día dado. */
const inicioDelDia = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/**
 * Recepción (ADMIN): registrar una reserva deportiva u hotelera a nombre de
 * un cliente registrado, buscándolo por su documento. Puede quedar
 * confirmada de una vez (cliente presente) o pendiente.
 *
 * ?tipo=deporte | hotel preselecciona el tipo (se usa desde el Navbar y los paneles).
 */
export default function NuevaReservaCliente() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ── 1. Cliente ──────────────────────────────────────────
  const [documento, setDocumento] = useState("");
  const [cliente, setCliente] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [errorCliente, setErrorCliente] = useState(null);

  // ── 2. Tipo de reserva ──────────────────────────────────
  const [tipo, setTipo] = useState(searchParams.get("tipo") === "hotel" ? "hotel" : "deporte");

  // Deportiva
  const [espacios, setEspacios] = useState([]);
  const [espacioId, setEspacioId] = useState("");
  const [inicio, setInicio] = useState(null);
  const [fin, setFin] = useState(null);
  const [implAlquilados, setImplAlquilados] = useState("");
  const [rqrEntrenador, setRqrEntrenador] = useState(false);
  const { estaOcupado, ocupadosDelDia } = useReservasDeporte();

  // Hotelera
  const [habitaciones, setHabitaciones] = useState([]);
  const [habitacionId, setHabitacionId] = useState("");
  const [ocupadasHabitacion, setOcupadasHabitacion] = useState([]);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);

  // ── 3. Confirmación ─────────────────────────────────────
  const [confirmarYa, setConfirmarYa] = useState(true);
  const [enviando, setEnviando] = useState(false);

  // Catálogos (solo espacios activos y habitaciones que no estén en mantenimiento)
  useEffect(() => {
    listarEspacios()
      .then((lista) => setEspacios(lista.filter((e) => e.estado === "ACTIVO")))
      .catch(() => setEspacios([]));
    listarTodasLasHabitaciones()
      .then((lista) => setHabitaciones(lista.filter((h) => h.estadoHabitacion !== "MANTENIMIENTO")))
      .catch(() => setHabitaciones([]));
  }, []);

  // Fechas ocupadas de la habitación elegida
  useEffect(() => {
    if (!habitacionId) return undefined;
    let activo = true;
    obtenerFechasOcupadas(habitacionId)
      .then((rangos) => { if (activo) setOcupadasHabitacion(rangos); })
      .catch(() => { if (activo) setOcupadasHabitacion([]); });
    return () => { activo = false; };
  }, [habitacionId]);

  const espacio = espacios.find((e) => e.id === espacioId);
  const habitacion = habitaciones.find((h) => h.id === habitacionId);

  // ── Cálculos ────────────────────────────────────────────
  const ocupadoDeporte = estaOcupado(espacioId, inicio, fin);
  const reservasDelDia = ocupadosDelDia(espacioId, inicio);
  const totalDeporte = precioEstimado(espacio, inicio, fin);

  const noches = checkIn && checkOut ? Math.round((inicioDelDia(checkOut) - inicioDelDia(checkIn)) / UN_DIA_MS) : 0;
  const totalHotel = habitacion && noches > 0 ? noches * (habitacion.precioNoche || 0) : null;
  const ocupadoHotel = checkIn && checkOut && haySolapamiento(checkIn, checkOut, ocupadasHabitacion);

  // Noches ya ocupadas: el día de check-out de otra reserva sí queda libre
  const diasBloqueados = useMemo(() => ocupadasHabitacion.map((r) => ({
    start: inicioDelDia(new Date(r.checkIn)),
    end: new Date(inicioDelDia(new Date(r.checkOut)).getTime() - UN_DIA_MS),
  })).filter((r) => r.end >= r.start), [ocupadasHabitacion]);

  // ── Acciones ────────────────────────────────────────────
  const buscarCliente = async (e) => {
    e.preventDefault();
    const doc = documento.trim();
    if (!doc) return;
    setBuscando(true);
    setErrorCliente(null);
    setCliente(null);
    try {
      setCliente(await obtenerUsuarioPorDocumento(doc));
    } catch (err) {
      setErrorCliente(err.message);
    } finally {
      setBuscando(false);
    }
  };

  const elegirEspacio = (id) => {
    setEspacioId(id);
    setInicio(null);
    setFin(null);
  };

  const elegirHabitacion = (id) => {
    setHabitacionId(id);
    setOcupadasHabitacion([]);
    setCheckIn(null);
    setCheckOut(null);
  };

  const elegirInicio = (valor) => {
    setInicio(valor);
    if (valor && (!fin || !finValido(espacio, valor, fin))) setFin(finSugerido(espacio, valor));
  };

  const elegirCheckIn = (valor) => {
    setCheckIn(valor);
    if (valor && checkOut && checkOut <= valor) setCheckOut(null);
  };

  const clienteActivo = cliente && cliente.estado !== "INACTIVO";
  const detalleListo = tipo === "deporte"
    ? espacio && inicio && fin && !ocupadoDeporte
    : habitacion && checkIn && checkOut && noches > 0 && !ocupadoHotel;
  const puedeEnviar = clienteActivo && detalleListo && !enviando;

  const registrar = async () => {
    const nombre = `${cliente.nombre} ${cliente.apellido}`;
    const filas = tipo === "deporte"
      ? { Cliente: nombre, Espacio: espacio.nombre, Fecha: `${fecha(inicio)} · ${hora(inicio)} – ${hora(fin)}`, Total: pesos(totalDeporte) }
      : { Huésped: nombre, Habitación: `N.º ${habitacion.numeroHabitacion}`, Estadía: `${fecha(checkIn)} → ${fecha(checkOut)} (${noches} noches)`, Total: pesos(totalHotel) };

    const { isConfirmed } = await Swal.fire({
      title: "¿Registrar la reserva?",
      html: `<div class="gb-swal-detalle">${Object.entries(filas)
        .map(([k, v]) => `<div><span>${escapeHtml(k)}</span><strong>${escapeHtml(v)}</strong></div>`).join("")}</div>
        <p class="gb-swal-nota">${confirmarYa
          ? "Quedará <strong>confirmada</strong> y el cliente recibirá el correo de confirmación."
          : "Quedará <strong>pendiente</strong> de aprobación."}</p>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, registrar",
      cancelButtonText: "Revisar",
      confirmButtonColor: "#f38d1e",
      cancelButtonColor: "#6c757d",
    });
    if (!isConfirmed) return;

    setEnviando(true);
    try {
      if (tipo === "deporte") {
        await crearReservaDeporte({
          espacioId,
          docUsuario: cliente.documento.numeroD,
          fInicioReserva: toLocalISOString(inicio),
          fFinReserva: toLocalISOString(fin),
          implAlquilados,
          rqrEntrenador,
        }, confirmarYa);
      } else {
        await crearReservaHotel({
          idHabitacion: habitacionId,
          docUsuario: cliente.documento.numeroD,
          // Mismo formato que la reserva del cliente (ReservasH / DetalleHabitacion)
          fCheckIn: checkIn.toISOString(),
          fCheckOut: checkOut.toISOString(),
        }, confirmarYa);
      }
      await Swal.fire({
        title: "Reserva registrada",
        text: confirmarYa ? "La reserva quedó confirmada." : "La reserva quedó pendiente de aprobación.",
        icon: "success",
        confirmButtonColor: "#f38d1e",
      });
      navigate(tipo === "deporte" ? "/reservas-deportivas/gestionar" : "/reservas-hoteleras/gestionar");
    } catch (err) {
      Swal.fire({ title: "No se pudo registrar", text: err.message, icon: "error", confirmButtonColor: "#f38d1e" });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="gb-panel">
      <button type="button" className="re-volver-recepcion" onClick={() => navigate(-1)}>
        <BsArrowLeft /> Volver
      </button>

      <div className="gb-panel-header">
        <div>
          <h1 className="gb-panel-titulo">Reservar para un <span>cliente</span></h1>
          <p className="gb-panel-subtitulo">Registra una reserva a nombre de un cliente registrado (por ejemplo, en recepción).</p>
        </div>
      </div>

      <div className="nr-pasos">
        {/* ── Paso 1: cliente ── */}
        <section className="nr-paso">
          <h2 className="nr-paso-titulo"><span>1</span> Cliente</h2>
          <Form onSubmit={buscarCliente} className="nr-busqueda">
            <Form.Control
              placeholder="Número de documento del cliente"
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              inputMode="numeric"
            />
            <button type="submit" className="btn-gb btn-gb-neutral" disabled={buscando || !documento.trim()}>
              {buscando ? <Spinner size="sm" /> : <BsSearch />} Buscar
            </button>
          </Form>

          {errorCliente && <Alert variant="warning" className="mt-3 mb-0">{errorCliente}</Alert>}

          {cliente && (
            <div className={`nr-cliente ${clienteActivo ? "" : "inactivo"}`}>
              {clienteActivo ? <BsPersonCheck className="nr-cliente-icono" /> : <BsPersonX className="nr-cliente-icono" />}
              <div>
                <strong>{cliente.nombre} {cliente.apellido}</strong>
                <span>{cliente.email}{cliente.telefono ? ` · ${cliente.telefono}` : ""}</span>
                <span>{cliente.documento?.tipo} {cliente.documento?.numeroD}</span>
                {!clienteActivo && <span className="nr-alerta">Cuenta inactiva: no se pueden registrar reservas a su nombre.</span>}
              </div>
            </div>
          )}
        </section>

        {/* ── Paso 2: tipo y detalle ── */}
        <section className={`nr-paso ${clienteActivo ? "" : "bloqueado"}`}>
          <h2 className="nr-paso-titulo"><span>2</span> Reserva</h2>

          <div className="nr-tipos">
            <button type="button" className={`nr-tipo ${tipo === "deporte" ? "activo" : ""}`} onClick={() => setTipo("deporte")}>
              <BsTrophy /> Deportiva
            </button>
            <button type="button" className={`nr-tipo ${tipo === "hotel" ? "activo" : ""}`} onClick={() => setTipo("hotel")}>
              <BsBuilding /> Hotelera
            </button>
          </div>

          {tipo === "deporte" ? (
            <>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Espacio</Form.Label>
                <Form.Select value={espacioId} onChange={(e) => elegirEspacio(e.target.value)}>
                  <option value="">Selecciona un espacio...</option>
                  {espacios.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nombre} — {pesos(e.tarifaHora)}/h · {e.horaApertura?.slice(0, 5)}–{e.horaCierre?.slice(0, 5)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Row>
                <Col sm={6} className="mb-3">
                  <Form.Label className="fw-bold">Entrada</Form.Label>
                  <div className="date-input-wrapper">
                    <BiCalendarAlt className="calendar-icon" />
                    <DatePicker
                      selected={inicio} onChange={elegirInicio} showTimeSelect timeIntervals={30}
                      dateFormat="Pp" locale="es" className="form-control custom-date-input"
                      placeholderText={espacio ? "dd/mm/aaaa --:--" : "Primero elige el espacio"}
                      disabled={!espacio} minDate={new Date()}
                      filterTime={(h) => inicioValido(espacio, h)}
                    />
                  </div>
                </Col>
                <Col sm={6} className="mb-3">
                  <Form.Label className="fw-bold">Salida</Form.Label>
                  <div className="date-input-wrapper">
                    <BiCalendarAlt className="calendar-icon" />
                    <DatePicker
                      selected={fin} onChange={setFin} showTimeSelect timeIntervals={30}
                      dateFormat="Pp" locale="es" className="form-control custom-date-input"
                      placeholderText={inicio ? "dd/mm/aaaa --:--" : "Primero elige la entrada"}
                      disabled={!inicio} minDate={inicio || new Date()} maxDate={inicio || undefined}
                      filterTime={(h) => finValido(espacio, inicio, h)}
                    />
                  </div>
                </Col>
              </Row>

              {inicio && reservasDelDia.length > 0 && (
                <div className="re-ocupados">
                  <strong>Horarios ya reservados ese día:</strong>
                  <div>{reservasDelDia.map((o) => (
                    <span key={o.inicio.getTime()} className="re-ocupado">{hora(o.inicio)} – {hora(o.fin)}</span>
                  ))}</div>
                </div>
              )}
              {ocupadoDeporte && <Alert variant="danger">Ese horario se cruza con otra reserva.</Alert>}

              <Row>
                <Col sm={8} className="mb-3">
                  <Form.Label className="fw-bold">Implementos adicionales</Form.Label>
                  <Form.Control maxLength={200} value={implAlquilados} onChange={(e) => setImplAlquilados(e.target.value)}
                    placeholder="Ej.: balones, raquetas..." />
                </Col>
                <Col sm={4} className="mb-3 d-flex align-items-end">
                  <Form.Check type="switch" id="nr-entrenador" label="Con entrenador"
                    checked={rqrEntrenador} onChange={(e) => setRqrEntrenador(e.target.checked)} />
                </Col>
              </Row>
            </>
          ) : (
            <>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Habitación</Form.Label>
                <Form.Select value={habitacionId} onChange={(e) => elegirHabitacion(e.target.value)}>
                  <option value="">Selecciona una habitación...</option>
                  {habitaciones.map((h) => (
                    <option key={h.id} value={h.id}>
                      N.º {h.numeroHabitacion} — {h.datosTipoHabitacion?.nomTipo || "Sin tipo"} · {pesos(h.precioNoche)}/noche
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Row>
                <Col sm={6} className="mb-3">
                  <Form.Label className="fw-bold">Check-in</Form.Label>
                  <div className="date-input-wrapper">
                    <BiCalendarAlt className="calendar-icon" />
                    <DatePicker
                      selected={checkIn} onChange={elegirCheckIn} dateFormat="dd/MM/yyyy" locale="es"
                      className="form-control custom-date-input"
                      placeholderText={habitacion ? "dd/mm/aaaa" : "Primero elige la habitación"}
                      disabled={!habitacion} minDate={new Date()} excludeDateIntervals={diasBloqueados}
                    />
                  </div>
                </Col>
                <Col sm={6} className="mb-3">
                  <Form.Label className="fw-bold">Check-out</Form.Label>
                  <div className="date-input-wrapper">
                    <BiCalendarAlt className="calendar-icon" />
                    <DatePicker
                      selected={checkOut} onChange={setCheckOut} dateFormat="dd/MM/yyyy" locale="es"
                      className="form-control custom-date-input"
                      placeholderText={checkIn ? "dd/mm/aaaa" : "Primero elige el check-in"}
                      disabled={!checkIn}
                      minDate={checkIn ? new Date(checkIn.getTime() + UN_DIA_MS) : new Date()}
                    />
                  </div>
                </Col>
              </Row>
              {ocupadoHotel && <Alert variant="danger">La habitación ya está reservada en parte de esas fechas.</Alert>}
            </>
          )}
        </section>

        {/* ── Paso 3: confirmación ── */}
        <section className={`nr-paso ${clienteActivo ? "" : "bloqueado"}`}>
          <h2 className="nr-paso-titulo"><span>3</span> Confirmación</h2>

          <div className="re-total mb-3">
            <span>Total</span>
            <strong>{pesos(tipo === "deporte" ? totalDeporte : totalHotel)}</strong>
          </div>

          <Form.Check
            type="switch"
            id="nr-confirmar"
            className="mb-1 fw-bold"
            label="Confirmar de inmediato (el cliente está presente)"
            checked={confirmarYa}
            onChange={(e) => setConfirmarYa(e.target.checked)}
          />
          <p className="nr-ayuda">
            {confirmarYa
              ? "La reserva quedará confirmada y el cliente recibirá el correo de confirmación."
              : "La reserva quedará pendiente y podrás aprobarla después desde la gestión de reservas."}
          </p>

          <button type="button" className="btn-gb btn-gb-primary w-100" disabled={!puedeEnviar} onClick={registrar}>
            {enviando ? "Registrando..." : <><BsCheck2Circle /> Registrar reserva</>}
          </button>
          {!clienteActivo && <p className="nr-ayuda text-center mt-2">Primero busca un cliente activo.</p>}
        </section>
      </div>
    </div>
  );
}
