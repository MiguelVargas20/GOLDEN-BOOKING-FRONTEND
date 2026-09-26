import { Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { BiBell } from "react-icons/bi";
import { BsCheckCircle, BsXCircle, BsCalendar2Week, BsHourglassBottom, BsStar, BsChatDots } from "react-icons/bs";
import { useNotificaciones } from "../hooks/useNotificaciones";
import { fechaHora } from "../../../shared/utils/formato";
import "../styles/Campana.css";

const ICONOS = {
  RESERVA_APROBADA: <BsCheckCircle className="cn-icono ok" />,
  RESERVA_CANCELADA: <BsXCircle className="cn-icono error" />,
  RESERVA_REPROGRAMADA: <BsCalendar2Week className="cn-icono info" />,
  RESERVA_VENCIDA: <BsHourglassBottom className="cn-icono gris" />,
  CALIFICAR: <BsStar className="cn-icono estrella" />,
};

/**
 * Campana del cliente: avisos de sus reservas (aprobada, cancelada,
 * reprogramada, vencida, calificar) y respuestas nuevas a sus mensajes.
 */
export default function CampanaCliente({ respuestasNoVistas = 0, abierto, onToggle }) {
  const navigate = useNavigate();
  const { noLeidas, lista, cargarLista, marcarLeida, marcarTodas } = useNotificaciones();
  const total = noLeidas + respuestasNoVistas;

  const alternar = (abrir) => {
    if (abrir) cargarLista();
    onToggle(abrir);
  };

  const abrir = (n) => {
    marcarLeida(n);
    onToggle(false);
    navigate(n.categoria === "DEPORTE" ? "/reservas-deportivas/mis-reservas" : "/reservas-hoteleras/mis-reservas");
  };

  return (
    <Dropdown show={abierto} onToggle={alternar} align="end" className="cn-campana mx-1 mx-md-2">
      <Dropdown.Toggle as="button" type="button" className="cn-boton" title="Notificaciones" aria-label="Notificaciones">
        <BiBell size={22} />
        {total > 0 && (
          <span className="cn-contador">
            {total > 9 ? "9+" : total}
            <span className="visually-hidden">notificaciones nuevas</span>
          </span>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu className="cn-menu">
        <div className="cn-cabecera">
          <strong>Notificaciones</strong>
          {noLeidas > 0 && <button type="button" className="cn-enlace" onClick={marcarTodas}>Marcar todas como leídas</button>}
        </div>

        {respuestasNoVistas > 0 && (
          <button type="button" className="cn-item no-leida" onClick={() => { onToggle(false); navigate("/mis-mensajes"); }}>
            <BsChatDots className="cn-icono info" />
            <span className="cn-texto">
              <strong>{respuestasNoVistas === 1 ? "Tienes una respuesta nueva" : `Tienes ${respuestasNoVistas} respuestas nuevas`}</strong>
              <span>La administración respondió tus mensajes.</span>
            </span>
          </button>
        )}

        {lista.length === 0 && respuestasNoVistas === 0 ? (
          <p className="cn-vacio">No tienes notificaciones.</p>
        ) : lista.map((n) => (
          <button key={n.id} type="button" className={`cn-item ${n.leida ? "" : "no-leida"}`} onClick={() => abrir(n)}>
            {ICONOS[n.tipo] || <BiBell className="cn-icono" />}
            <span className="cn-texto">
              <strong>{n.titulo}</strong>
              <span>{n.mensaje}</span>
              <small>{fechaHora(n.fecha)}</small>
            </span>
          </button>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}
