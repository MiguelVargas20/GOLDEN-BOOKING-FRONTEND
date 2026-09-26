import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { BsCalendarEvent } from "react-icons/bs";
import { listarProximosEventos } from "../api/EventoApi";
import { CATEGORIAS_EVENTO } from "../utils";
import TarjetaEvento from "../components/TarjetaEvento";
import "../../../shared/styles/PanelAdmin.css";
import "../../../shared/styles/Catalogo.css";
import "../styles/Eventos.css";

/** Agenda de eventos del club para el cliente, con filtro por categoría. */
export default function EventosCliente() {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [categoria, setCategoria] = useState("");

  useEffect(() => {
    listarProximosEventos()
      .then(setEventos)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  const categorias = [...new Set(eventos.map((e) => e.categoria))];
  const visibles = categoria ? eventos.filter((e) => e.categoria === categoria) : eventos;

  return (
    <div className="gb-panel">
      <div className="gb-panel-header">
        <div>
          <h1 className="gb-panel-titulo">Eventos del <span>club</span></h1>
          <p className="gb-panel-subtitulo">Baile, actividades recreativas, festivales y más. ¡No te los pierdas!</p>
        </div>
      </div>

      {categorias.length > 1 && (
        <div className="gb-chips mb-3" role="group" aria-label="Filtrar por categoría">
          <button type="button" className={`gb-chip ${categoria === "" ? "activo" : ""}`} aria-pressed={categoria === ""} onClick={() => setCategoria("")}>Todos</button>
          {categorias.map((c) => (
            <button key={c} type="button" className={`gb-chip ${categoria === c ? "activo" : ""}`} aria-pressed={categoria === c} onClick={() => setCategoria(c)}>
              {CATEGORIAS_EVENTO[c]}
            </button>
          ))}
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}
      {cargando ? (
        <div className="text-center py-5"><Spinner /></div>
      ) : visibles.length === 0 ? (
        <div className="gb-tarjeta text-center py-5">
          <BsCalendarEvent size={36} className="mb-2 ev-icono-vacio" />
          <p className="gb-ayuda m-0">No hay eventos programados por ahora. Te avisaremos en la campana cuando haya uno nuevo.</p>
        </div>
      ) : (
        <div className="ev-grid">
          {visibles.map((ev) => <TarjetaEvento key={ev.id} evento={ev} />)}
        </div>
      )}
    </div>
  );
}
