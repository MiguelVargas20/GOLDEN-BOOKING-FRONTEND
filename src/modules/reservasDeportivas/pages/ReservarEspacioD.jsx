import { useMemo, useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { Form, Row, Col, Alert } from "react-bootstrap";
import Swal from "sweetalert2";
import DatePicker, { registerLocale } from "react-datepicker";
import { es } from "date-fns/locale";
import { BiCalendarAlt } from "react-icons/bi";
import { BsClock, BsPeople, BsCashCoin, BsArrowLeft } from "react-icons/bs";
import "react-datepicker/dist/react-datepicker.css";
import "../../../shared/styles/DatePickerCompartido.css";
import "../../../shared/styles/PanelAdmin.css";
import "../../../shared/styles/BotonesCompartidos.css";
import "../styles/GestionEspacios.css";
import "../styles/ReservarEspacio.css";
import { crearReservaDeporte } from "../api/ReservaDeporteApi.js";
import { useAuth } from "../../../shared/context/AuthContext";
import { useReservasDeporte } from "../hooks/useReservasDeporte";
import { useRequierePerfilCompleto } from "../../../shared/hooks/useRequirePerfilCompleto.js";
import { imagenEspacio } from "../utils/imagenEspacio";
import { pesos, hora } from "../../../shared/utils/formato";
import { escapeHtml } from "../../../shared/utils/escapeHtml";

registerLocale("es", es);

const UNA_HORA_MS = 60 * 60 * 1000;

/**
 * Convierte un Date a "YYYY-MM-DDTHH:mm:ss" con la hora LOCAL del navegador
 * (toISOString() convertiría a UTC y correría la hora).
 */
function toLocalISOString(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/** "HH:mm[:ss]" → minutos desde medianoche. */
const aMinutos = (hhmm) => {
  const [h, m] = (hhmm || "00:00").split(":").map(Number);
  return h * 60 + m;
};
const minutosDe = (fecha) => fecha.getHours() * 60 + fecha.getMinutes();

/**
 * Reserva de un espacio deportivo. Recibe el espacio elegido en el catálogo
 * (state.espacio) y respeta su horario de apertura/cierre y su tarifa.
 */
function ReservarEspacioD() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { verificarPerfil } = useRequierePerfilCompleto();
  const { estaOcupado, ocupadosDelDia, conectado } = useReservasDeporte();

  const espacio = state?.espacio;
  const [inicio, setInicio] = useState(null);
  const [fin, setFin] = useState(null);
  const [implAlquilados, setImplAlquilados] = useState("");
  const [rqrEntrenador, setRqrEntrenador] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const apertura = aMinutos(espacio?.horaApertura);
  const cierre = aMinutos(espacio?.horaCierre);

  const ocupado = estaOcupado(espacio?.id, inicio, fin);
  const reservasDelDia = ocupadosDelDia(espacio?.id, inicio);

  const precioEstimado = useMemo(() => {
    if (!inicio || !fin || fin <= inicio) return null;
    return Math.round(((fin - inicio) / UNA_HORA_MS) * (espacio?.tarifaHora || 0));
  }, [inicio, fin, espacio]);

  // Entró directo por URL sin elegir espacio: volver al catálogo
  if (!espacio) return <Navigate to="/reservas-deportivas" replace />;

  // Horas permitidas: dentro del horario del espacio y no en el pasado
  const horaInicioValida = (h) => h > new Date() && minutosDe(h) >= apertura && minutosDe(h) + 60 <= cierre;
  // Salida: mismo día, al menos 1 hora después de la entrada y antes del cierre
  const finValidaPara = (entrada, h) => Boolean(entrada)
    && h.toDateString() === entrada.toDateString()
    && h.getTime() >= entrada.getTime() + UNA_HORA_MS
    && minutosDe(h) <= cierre;
  const horaFinValida = (h) => finValidaPara(inicio, h);

  const elegirInicio = (fecha) => {
    setInicio(fecha);
    // Si la salida ya no es válida con la nueva entrada, se sugiere 1 hora después
    if (fecha && (!fin || !finValidaPara(fecha, fin))) {
      const sugerida = new Date(fecha.getTime() + UNA_HORA_MS);
      setFin(minutosDe(sugerida) <= cierre && sugerida.toDateString() === fecha.toDateString() ? sugerida : null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const docUsuario = verificarPerfil(user);
    if (!docUsuario) return;

    if (!inicio || !fin) {
      Swal.fire({ title: "Elige tu horario", text: "Selecciona la hora de entrada y de salida.", icon: "warning", confirmButtonColor: "#f38d1e" });
      return;
    }
    if (ocupado) {
      Swal.fire({ title: "Horario no disponible", text: "Ese horario se cruza con otra reserva. Elige otro.", icon: "error", confirmButtonColor: "#f38d1e" });
      return;
    }

    const { isConfirmed } = await Swal.fire({
      title: "¿Enviar solicitud de reserva?",
      html: `
        <div class="gb-swal-detalle">
          <div><span>Espacio</span><strong>${escapeHtml(espacio.nombre)}</strong></div>
          <div><span>Fecha</span><strong>${inicio.toLocaleDateString("es-CO")}</strong></div>
          <div><span>Horario</span><strong>${hora(inicio)} – ${hora(fin)}</strong></div>
          <div><span>Total estimado</span><strong>${pesos(precioEstimado)}</strong></div>
        </div>
        <p class="gb-swal-nota">Tu reserva quedará <strong>pendiente</strong> hasta que la administración la apruebe. Te avisaremos por correo.</p>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, enviar solicitud",
      cancelButtonText: "Revisar",
      confirmButtonColor: "#f38d1e",
      cancelButtonColor: "#6c757d",
    });
    if (!isConfirmed) return;

    setEnviando(true);
    try {
      await crearReservaDeporte({
        espacioId: espacio.id,
        docUsuario,
        fInicioReserva: toLocalISOString(inicio),
        fFinReserva: toLocalISOString(fin),
        implAlquilados,
        rqrEntrenador,
      });
      await Swal.fire({
        title: "¡Solicitud enviada!",
        text: "Tu reserva está pendiente de aprobación. Te avisaremos por correo cuando sea confirmada.",
        icon: "success",
        confirmButtonColor: "#f38d1e",
      });
      navigate(isAdmin() ? "/reservas-deportivas/gestionar" : "/reservas-deportivas/mis-reservas");
    } catch (err) {
      Swal.fire({ title: "No se pudo reservar", text: err.message || "Error al conectar con el servidor.", icon: "error", confirmButtonColor: "#f38d1e" });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="gb-panel">
      <button type="button" className="re-volver" onClick={() => navigate("/reservas-deportivas")}>
        <BsArrowLeft /> Volver al catálogo
      </button>

      <div className="re-layout">
        {/* Información del espacio */}
        <aside className="re-espacio">
          <div className="re-imagen"><img src={imagenEspacio(espacio)} alt={espacio.nombre} /></div>
          <div className="re-espacio-info">
            <span className="ge-deporte">{espacio.deporte}</span>
            <h1 className="re-nombre">{espacio.nombre}</h1>
            {espacio.descripcion && <p className="re-descripcion">{espacio.descripcion}</p>}
            <ul className="ge-datos">
              <li><BsCashCoin /> {pesos(espacio.tarifaHora)} / hora</li>
              <li><BsPeople /> Hasta {espacio.capacidad} personas</li>
              <li><BsClock /> Horario: {espacio.horaApertura?.slice(0, 5)} – {espacio.horaCierre?.slice(0, 5)}</li>
            </ul>
            <span className={`re-vivo ${conectado ? "on" : ""}`}>{conectado ? "● Disponibilidad en vivo" : "○ Conectando..."}</span>
          </div>
        </aside>

        {/* Formulario */}
        <Form className="re-form" onSubmit={handleSubmit}>
          <h2 className="re-form-titulo">Elige tu horario</h2>

          <Row>
            <Col sm={6} className="mb-3">
              <Form.Label className="fw-bold">Entrada</Form.Label>
              <div className="date-input-wrapper">
                <BiCalendarAlt className="calendar-icon" />
                <DatePicker
                  selected={inicio}
                  onChange={elegirInicio}
                  showTimeSelect
                  timeIntervals={30}
                  dateFormat="Pp"
                  locale="es"
                  className="form-control custom-date-input"
                  placeholderText="dd/mm/aaaa --:--"
                  minDate={new Date()}
                  filterTime={horaInicioValida}
                />
              </div>
            </Col>
            <Col sm={6} className="mb-3">
              <Form.Label className="fw-bold">Salida</Form.Label>
              <div className="date-input-wrapper">
                <BiCalendarAlt className="calendar-icon" />
                <DatePicker
                  selected={fin}
                  onChange={setFin}
                  showTimeSelect
                  timeIntervals={30}
                  dateFormat="Pp"
                  locale="es"
                  className="form-control custom-date-input"
                  placeholderText={inicio ? "dd/mm/aaaa --:--" : "Primero elige la entrada"}
                  disabled={!inicio}
                  minDate={inicio || new Date()}
                  maxDate={inicio || undefined}
                  filterTime={horaFinValida}
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

          {ocupado && (
            <Alert variant="danger" className="fw-bold">
              Ese horario se cruza con otra reserva. Elige otro horario.
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Implementos adicionales</Form.Label>
            <Form.Control
              maxLength={200}
              placeholder="Ej.: balones, raquetas, petos..."
              value={implAlquilados}
              onChange={(e) => setImplAlquilados(e.target.value)}
            />
          </Form.Group>

          <Form.Check
            type="switch"
            id="rqr-entrenador"
            label="¿Requiere un entrenador profesional?"
            className="mb-4 fw-bold"
            checked={rqrEntrenador}
            onChange={(e) => setRqrEntrenador(e.target.checked)}
          />

          <div className="re-total">
            <span>Total estimado</span>
            <strong>{precioEstimado !== null ? pesos(precioEstimado) : "—"}</strong>
          </div>

          <div className="d-flex gap-3 mt-3">
            <button type="submit" className="btn-gb btn-gb-primary w-100" disabled={enviando || ocupado}>
              {enviando ? "Enviando..." : ocupado ? "Horario no disponible" : "Solicitar reserva"}
            </button>
            <button type="button" className="btn-gb btn-gb-secondary w-100" onClick={() => navigate(-1)}>
              Cancelar
            </button>
          </div>
          <p className="re-nota">La reserva queda pendiente hasta que la administración la apruebe.</p>
        </Form>
      </div>
    </div>
  );
}

export default ReservarEspacioD;
