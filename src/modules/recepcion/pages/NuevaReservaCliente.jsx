import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Form, Row, Col, Spinner, Alert } from "react-bootstrap";
import Swal from "sweetalert2";
import {
  BsSearch, BsPersonCheck, BsPersonX, BsTrophy, BsBuilding, BsCheck2Circle, BsArrowLeft, BsCheck2,
} from "react-icons/bs";
import CampoFecha from "../../../shared/components/fechas/CampoFecha";
import SelectorHorario from "../../../shared/components/fechas/SelectorHorario";
import EditorMiembros from "../../../shared/components/reservas/EditorMiembros";
import { limpiarMiembros, validarMiembros } from "../../../shared/utils/miembros";
import { aHora, aMinutos } from "../../../shared/utils/horas";
import "../../../shared/styles/PanelAdmin.css";
import "../../../shared/styles/BotonesCompartidos.css";
import "../../reservasDeportivas/styles/ReservarEspacio.css"; // .re-ocupados, .re-total
import "../styles/NuevaReservaCliente.css";

import { obtenerUsuarioPorDocumento } from "../../usuarios/api/UserApi";
import { listarEspacios } from "../../reservasDeportivas/api/EspacioDeportivoApi";
import { crearReservaDeporte } from "../../reservasDeportivas/api/ReservaDeporteApi";
import { useReservasDeporte } from "../../reservasDeportivas/hooks/useReservasDeporte";
import { toLocalISOString, precioEstimado } from "../../reservasDeportivas/utils/horarioEspacio";
import { listarTodasLasHabitaciones } from "../../habitaciones/api/HabitacionApi";
import { datosTipo } from "../../habitaciones/utils/tipoHabitacion";
import { crearReservaHotel, obtenerFechasOcupadas } from "../../reservasHoteleras/api/ReservaHotelApi";
import { haySolapamiento } from "../../reservasHoteleras/utils/fechasHotel";
import { aFecha, aInicioDelDiaLocal, aTextoFecha } from "../../../shared/utils/fechas";
import { pesos, hora, fecha } from "../../../shared/utils/formato";
import { escapeHtml } from "../../../shared/utils/escapeHtml";

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
  const [dia, setDia] = useState("");
  const [horaSel, setHoraSel] = useState("");
  const [duracion, setDuracion] = useState(60);
  const [implementos, setImplementos] = useState([]);
  const [implAlquilados, setImplAlquilados] = useState("");
  const [miembros, setMiembros] = useState([]);
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
  const inicio = dia && horaSel ? new Date(`${dia}T${horaSel}:00`) : null;
  const fin = inicio ? new Date(`${dia}T${aHora(aMinutos(horaSel) + duracion)}:00`) : null;
  const habitacion = habitaciones.find((h) => h.id === habitacionId);

  // ── Cálculos ────────────────────────────────────────────
  const ocupadoDeporte = estaOcupado(espacioId, inicio, fin);
  const totalDeporte = precioEstimado(espacio, inicio, fin);

  const noches = checkIn && checkOut ? Math.round((inicioDelDia(checkOut) - inicioDelDia(checkIn)) / UN_DIA_MS) : 0;
  const totalHotel = habitacion && noches > 0 ? noches * (habitacion.precioNoche || 0) : null;
  const ocupadoHotel = checkIn && checkOut && haySolapamiento(checkIn, checkOut, ocupadasHabitacion);

  // Noches ya ocupadas: el día de check-out de otra reserva sí queda libre
  const diasBloqueados = useMemo(() => ocupadasHabitacion.map((r) => ({
    start: inicioDelDia(aFecha(r.checkIn)),
    end: new Date(inicioDelDia(aFecha(r.checkOut)).getTime() - UN_DIA_MS),
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
    setHoraSel("");
    setImplementos([]);
  };

  const elegirHabitacion = (id) => {
    setHabitacionId(id);
    setOcupadasHabitacion([]);
    setCheckIn(null);
    setCheckOut(null);
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
    const problema = validarMiembros(miembros, cliente.documento?.numeroD);
    if (problema) {
      Swal.fire({ title: "Revisa los acompañantes", text: problema, icon: "warning", confirmButtonColor: "#f38d1e" });
      return;
    }
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
          implAlquilados: [...implementos, implAlquilados.trim()].filter(Boolean).join(", "),
          rqrEntrenador,
          miembros: limpiarMiembros(miembros),
        }, confirmarYa);
      } else {
        await crearReservaHotel({
          idHabitacion: habitacionId,
          docUsuario: cliente.documento.numeroD,
          // Mismo formato que la reserva del cliente (ReservasH / DetalleHabitacion)
          fCheckIn: aInicioDelDiaLocal(checkIn),
          fCheckOut: aInicioDelDiaLocal(checkOut),
          miembros: limpiarMiembros(miembros),
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

              <div className="mb-3">
                <Form.Label htmlFor="nr-dia" className="fw-bold">Día</Form.Label>
                <CampoFecha id="nr-dia" valor={dia} min={aTextoFecha(new Date())} disabled={!espacio}
                  placeholder={espacio ? "Elige el día" : "Primero elige el espacio"}
                  onCambio={(d) => { setDia(d); setHoraSel(""); }} />
              </div>
              {espacio && (
                <div className="mb-3">
                  <SelectorHorario espacio={espacio} dia={dia} ocupados={dia ? ocupadosDelDia(espacioId, aFecha(dia)) : []}
                    hora={horaSel} duracion={duracion} onCambio={({ hora: h, duracion: d }) => { setHoraSel(h); setDuracion(d); }} />
                </div>
              )}
              {ocupadoDeporte && <Alert variant="danger">Ese horario se cruza con otra reserva.</Alert>}

              {espacio && (
                <div className="mb-3">
                  <span className="fw-bold d-block mb-2">Implementos</span>
                  <div className="re-implementos">
                    {(espacio.implementos || []).map((n) => (
                      <button key={n} type="button" aria-pressed={implementos.includes(n)}
                        className={`gb-chip ${implementos.includes(n) ? "activo" : ""}`}
                        onClick={() => setImplementos((l) => (l.includes(n) ? l.filter((x) => x !== n) : [...l, n]))}>
                        {implementos.includes(n) && <BsCheck2 />} {n}
                      </button>
                    ))}
                  </div>
                  <Form.Control className="mt-2" maxLength={80} value={implAlquilados} placeholder="¿Otro? (opcional)"
                    onChange={(e) => setImplAlquilados(e.target.value)} />
                </div>
              )}
              <Form.Check type="switch" id="nr-entrenador" label="Con entrenador" className="mb-3"
                checked={rqrEntrenador} onChange={(e) => setRqrEntrenador(e.target.checked)} />
              <div className="mb-3">
                <span className="fw-bold d-block mb-2">Acompañantes</span>
                <EditorMiembros miembros={miembros} onCambio={setMiembros}
                  maximo={espacio ? Math.max(0, (espacio.capacidad || 1) - 1) : undefined} deshabilitado={!espacio} />
              </div>
            </>
          ) : (
            <>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Habitación</Form.Label>
                <Form.Select value={habitacionId} onChange={(e) => elegirHabitacion(e.target.value)}>
                  <option value="">Selecciona una habitación...</option>
                  {habitaciones.map((h) => (
                    <option key={h.id} value={h.id}>
                      N.º {h.numeroHabitacion} — {datosTipo(h).nombre || "Sin tipo"} · {pesos(h.precioNoche)}/noche
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Row>
                <Col sm={6} className="mb-3">
                  <Form.Label htmlFor="nr-checkin" className="fw-bold">Check-in</Form.Label>
                  <CampoFecha id="nr-checkin" valor={checkIn ? aTextoFecha(checkIn) : ""} disabled={!habitacion}
                    placeholder={habitacion ? "Llegada" : "Primero elige la habitación"} min={aTextoFecha(new Date())}
                    excluir={diasBloqueados} onCambio={(d) => elegirCheckIn(d ? aFecha(d) : null)} />
                </Col>
                <Col sm={6} className="mb-3">
                  <Form.Label htmlFor="nr-checkout" className="fw-bold">Check-out</Form.Label>
                  <CampoFecha id="nr-checkout" valor={checkOut ? aTextoFecha(checkOut) : ""} disabled={!checkIn}
                    placeholder={checkIn ? "Salida" : "Primero elige el check-in"}
                    min={checkIn ? aTextoFecha(new Date(checkIn.getTime() + UN_DIA_MS)) : aTextoFecha(new Date())}
                    onCambio={(d) => setCheckOut(d ? aFecha(d) : null)} />
                </Col>
              </Row>
              <div className="mb-3">
                <span className="fw-bold d-block mb-2">Acompañantes</span>
                <EditorMiembros miembros={miembros} onCambio={setMiembros} deshabilitado={!habitacion}
                  maximo={habitacion && datosTipo(habitacion).capacidad ? Math.max(0, datosTipo(habitacion).capacidad - 1) : undefined} />
              </div>
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
