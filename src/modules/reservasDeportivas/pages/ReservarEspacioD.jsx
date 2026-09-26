import { useMemo, useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { Form } from "react-bootstrap";
import Swal from "sweetalert2";
import { BsClock, BsPeople, BsCashCoin, BsArrowLeft, BsCheck2, BsAward } from "react-icons/bs";
import "../../../shared/styles/PanelAdmin.css";
import "../../../shared/styles/BotonesCompartidos.css";
import "../styles/GestionEspacios.css";
import "../styles/ReservarEspacio.css";
import { crearReservaDeporte } from "../api/ReservaDeporteApi.js";
import { useAuth } from "../../../shared/context/AuthContext";
import { useReservasDeporte } from "../hooks/useReservasDeporte";
import { useRequierePerfilCompleto } from "../../../shared/hooks/useRequirePerfilCompleto.js";
import { imagenEspacio, usarImagenDeRespaldo } from "../utils/imagenEspacio";
import { pesos } from "../../../shared/utils/formato";
import { escapeHtml } from "../../../shared/utils/escapeHtml";
import { aFecha, aTextoFecha } from "../../../shared/utils/fechas";
import { toLocalISOString } from "../utils/horarioEspacio";
import CampoFecha from "../../../shared/components/fechas/CampoFecha";
import SelectorHorario from "../../../shared/components/fechas/SelectorHorario";
import { aHora, aMinutos } from "../../../shared/utils/horas";
import EditorMiembros from "../../../shared/components/reservas/EditorMiembros";
import { limpiarMiembros, validarMiembros } from "../../../shared/utils/miembros";
import Opiniones from "../../calificaciones/components/Opiniones";
import { useMiMembresia, NOMBRE_MEMBRESIA } from "../../membresias/hooks/useMiMembresia";

const HOY = aTextoFecha(new Date());
const sumarDias = (dias) => { const d = new Date(); d.setDate(d.getDate() + dias); return aTextoFecha(d); };

/**
 * Reserva de un espacio deportivo: día (calendario), hora de entrada y
 * duración con botones, implementos sugeridos para ese espacio y acompañantes.
 * Si el cliente es socio se muestra su descuento.
 */
function ReservarEspacioD() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { verificarPerfil } = useRequierePerfilCompleto();
  const { estaOcupado, ocupadosDelDia, conectado } = useReservasDeporte();
  const membresia = useMiMembresia();

  const espacio = state?.espacio;
  const [dia, setDia] = useState("");
  const [hora, setHora] = useState("");
  const [duracion, setDuracion] = useState(60);
  const [implementos, setImplementos] = useState([]);
  const [otroImplemento, setOtroImplemento] = useState("");
  const [rqrEntrenador, setRqrEntrenador] = useState(false);
  const [miembros, setMiembros] = useState([]);
  const [enviando, setEnviando] = useState(false);

  const inicio = dia && hora ? new Date(`${dia}T${hora}:00`) : null;
  const fin = inicio ? new Date(`${dia}T${aHora(aMinutos(hora) + duracion)}:00`) : null;
  const ocupados = useMemo(() => (dia ? ocupadosDelDia(espacio?.id, aFecha(dia)) : []), [dia, espacio?.id, ocupadosDelDia]);
  const ocupado = estaOcupado(espacio?.id, inicio, fin);

  if (!espacio) return <Navigate to="/reservas-deportivas" replace />;

  const descuento = membresia?.descuento || 0;
  const bruto = inicio ? Math.round((duracion / 60) * espacio.tarifaHora) : null;
  const total = bruto !== null ? Math.round(bruto * (1 - descuento / 100)) : null;
  const maxDia = membresia ? sumarDias(membresia.diasAnticipacion) : undefined;
  const cupos = Math.max(0, (espacio.capacidad || 1) - 1);
  const sugeridos = espacio.implementos || [];

  const alternarImplemento = (nombre) =>
    setImplementos((lista) => (lista.includes(nombre) ? lista.filter((x) => x !== nombre) : [...lista, nombre]));
  const textoImplementos = [...implementos, otroImplemento.trim()].filter(Boolean).join(", ");

  const elegirDia = (nuevo) => {
    setDia(nuevo);
    setHora("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const docUsuario = verificarPerfil(user);
    if (!docUsuario) return;

    if (!inicio) {
      Swal.fire({ title: "Elige tu horario", text: "Selecciona el día y la hora de entrada.", icon: "warning", confirmButtonColor: "#f38d1e" });
      return;
    }
    if (ocupado) {
      Swal.fire({ title: "Horario no disponible", text: "Ese horario se cruza con otra reserva. Elige otro.", icon: "error", confirmButtonColor: "#f38d1e" });
      return;
    }
    const problema = validarMiembros(miembros, docUsuario);
    if (problema) {
      Swal.fire({ title: "Revisa los acompañantes", text: problema, icon: "warning", confirmButtonColor: "#f38d1e" });
      return;
    }

    const { isConfirmed } = await Swal.fire({
      title: "¿Enviar solicitud de reserva?",
      html: `
        <div class="gb-swal-detalle">
          <div><span>Espacio</span><strong>${escapeHtml(espacio.nombre)}</strong></div>
          <div><span>Fecha</span><strong>${inicio.toLocaleDateString("es-CO")}</strong></div>
          <div><span>Horario</span><strong>${hora} – ${aHora(aMinutos(hora) + duracion)}</strong></div>
          ${textoImplementos ? `<div><span>Implementos</span><strong>${escapeHtml(textoImplementos)}</strong></div>` : ""}
          <div><span>Personas</span><strong>${miembros.length + 1}</strong></div>
          <div><span>Total estimado</span><strong>${pesos(total)}${descuento ? ` (−${descuento} %)` : ""}</strong></div>
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
        implAlquilados: textoImplementos,
        rqrEntrenador,
        miembros: limpiarMiembros(miembros),
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
        <aside className="re-espacio">
          <div className="re-imagen"><img src={imagenEspacio(espacio)} alt={espacio.nombre} onError={usarImagenDeRespaldo(espacio)} /></div>
          <div className="re-espacio-info">
            <span className="ge-deporte">{espacio.deporte}</span>
            <h1 className="re-nombre">{espacio.nombre}</h1>
            {espacio.descripcion && <p className="re-descripcion">{espacio.descripcion}</p>}
            <ul className="ge-datos">
              <li><BsCashCoin /> {pesos(espacio.tarifaHora)} / hora</li>
              <li><BsPeople /> Hasta {espacio.capacidad} personas</li>
              <li><BsClock /> Horario: {espacio.horaApertura?.slice(0, 5)} – {espacio.horaCierre?.slice(0, 5)}</li>
            </ul>
            {descuento > 0 && (
              <span className="re-socio"><BsAward /> {NOMBRE_MEMBRESIA[membresia.membresia]}: {descuento} % de descuento</span>
            )}
            <span className={`re-vivo ${conectado ? "on" : ""}`}>{conectado ? "● Disponibilidad en vivo" : "○ Conectando..."}</span>
          </div>
        </aside>

        <Form className="re-form" onSubmit={handleSubmit}>
          <h2 className="re-form-titulo">Elige tu horario</h2>

          <div className="re-paso">
            <Form.Label htmlFor="re-dia" className="fw-bold">Día</Form.Label>
            <CampoFecha id="re-dia" valor={dia} onCambio={elegirDia} min={HOY} max={maxDia} placeholder="¿Qué día quieres jugar?" />
            {maxDia && <span className="gb-ayuda">Puedes reservar con hasta {membresia.diasAnticipacion} días de anticipación.</span>}
          </div>

          <div className="re-paso">
            <SelectorHorario espacio={espacio} dia={dia} ocupados={ocupados} hora={hora} duracion={duracion}
              onCambio={({ hora: h, duracion: d }) => { setHora(h); setDuracion(d); }} />
          </div>

          <div className="re-paso">
            <span className="fw-bold d-block mb-2">Implementos</span>
            <div className="re-implementos" role="group" aria-label="Implementos">
              {sugeridos.map((nombre) => (
                <button key={nombre} type="button" aria-pressed={implementos.includes(nombre)}
                  className={`gb-chip ${implementos.includes(nombre) ? "activo" : ""}`} onClick={() => alternarImplemento(nombre)}>
                  {implementos.includes(nombre) && <BsCheck2 />} {nombre}
                </button>
              ))}
            </div>
            <Form.Control className="mt-2" maxLength={80} placeholder="¿Otro? Escríbelo aquí (opcional)"
              value={otroImplemento} onChange={(e) => setOtroImplemento(e.target.value)} />
          </div>

          <div className="re-paso">
            <span className="fw-bold d-block mb-2">Acompañantes</span>
            <EditorMiembros miembros={miembros} onCambio={setMiembros} maximo={cupos} />
          </div>

          <Form.Check type="switch" id="rqr-entrenador" label="¿Requiere un entrenador profesional?" className="mb-3 fw-bold"
            checked={rqrEntrenador} onChange={(e) => setRqrEntrenador(e.target.checked)} />

          <div className="re-total">
            <span>Total estimado{descuento ? ` (−${descuento} % socio)` : ""}</span>
            <strong>{total !== null ? pesos(total) : "—"}</strong>
          </div>

          <div className="d-flex gap-3 mt-3">
            <button type="submit" className="btn-gb btn-gb-primary w-100" disabled={enviando || ocupado}>
              {enviando ? "Enviando..." : ocupado ? "Horario no disponible" : "Solicitar reserva"}
            </button>
            <button type="button" className="btn-gb btn-gb-secondary w-100" onClick={() => navigate(-1)}>Cancelar</button>
          </div>
          <p className="re-nota">La reserva queda pendiente hasta que la administración la apruebe.</p>
        </Form>
      </div>
      <Opiniones categoria="DEPORTE" idRecurso={espacio.id} />
    </div>
  );
}

export default ReservarEspacioD;
