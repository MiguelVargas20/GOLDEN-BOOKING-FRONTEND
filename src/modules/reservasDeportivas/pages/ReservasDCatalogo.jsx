import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import { BsCalendar4, BsArrowCounterclockwise, BsGrid, BsClock, BsPeople, BsCashCoin } from "react-icons/bs";
import { useAuth } from "../../../shared/context/AuthContext";
import { listarEspacios } from "../api/EspacioDeportivoApi";
import { imagenEspacio, usarImagenDeRespaldo } from "../utils/imagenEspacio";
import { pesos } from "../../../shared/utils/formato";
import "../../../shared/styles/PanelAdmin.css";
import "../styles/GestionEspacios.css";

/** "06:00:00" → "06:00" */
const hhmm = (valor) => (valor ? valor.slice(0, 5) : "");

/**
 * Catálogo de espacios deportivos. Antes eran 10 tarjetas fijas en el código;
 * ahora vienen del backend y el admin los administra. Los que están en
 * mantenimiento se muestran, pero no se pueden reservar.
 */
function ReservasDCatalogo() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [espacios, setEspacios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [deporte, setDeporte] = useState("TODOS");

  useEffect(() => {
    listarEspacios()
      // El admin recibe también los INACTIVOS: en el catálogo no se muestran
      .then((lista) => setEspacios(lista.filter((e) => e.estado !== "INACTIVO")))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  const deportes = useMemo(() => [...new Set(espacios.map((e) => e.deporte))].sort(), [espacios]);
  const visibles = deporte === "TODOS" ? espacios : espacios.filter((e) => e.deporte === deporte);

  const reservar = (espacio) => {
    if (espacio.estado !== "ACTIVO") return;
    navigate("/reservas-deportivas/reservar-espacio", { state: { espacio } });
  };

  return (
    <div className="gb-panel">
      <div className="gb-panel-header">
        <div>
          <h1 className="gb-panel-titulo">Reservas <span>deportivas</span></h1>
          <p className="gb-panel-subtitulo">Elige un espacio y reserva tu horario. Tu solicitud quedará pendiente hasta que sea aprobada.</p>
        </div>
        <div className="gb-panel-acciones">
          {isAdmin() && (
            <>
              <button type="button" className="btn-gb btn-gb-neutral btn-gb-sm" onClick={() => navigate("/reservas-deportivas/gestionar")}>
                <BsCalendar4 /> Gestionar reservas
              </button>
              <button type="button" className="btn-gb btn-gb-neutral btn-gb-sm" onClick={() => navigate("/reservas-deportivas/espacios")}>
                <BsGrid /> Espacios
              </button>
            </>
          )}
          <button type="button" className="btn-gb btn-gb-primary btn-gb-sm" onClick={() => navigate("/reservas-deportivas/mis-reservas")}>
            <BsArrowCounterclockwise /> Mis reservas
          </button>
        </div>
      </div>

      {deportes.length > 1 && (
        <div className="gb-chips">
          {["TODOS", ...deportes].map((d) => (
            <button key={d} type="button" className={`gb-chip ${deporte === d ? "activo" : ""}`} onClick={() => setDeporte(d)}>
              {d === "TODOS" ? "Todos" : d}
            </button>
          ))}
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {cargando ? (
        <div className="text-center py-5"><Spinner animation="border" style={{ color: "#f38d1e" }} /></div>
      ) : visibles.length === 0 ? (
        <div className="gb-vacio"><p>No hay espacios disponibles por ahora.</p></div>
      ) : (
        <div className="ge-grid">
          {visibles.map((e) => {
            const disponible = e.estado === "ACTIVO";
            return (
              <article
                key={e.id}
                className={`ge-card ${disponible ? "clickable" : "atenuada no-disponible"}`}
                onClick={() => reservar(e)}
                role={disponible ? "button" : undefined}
                tabIndex={disponible ? 0 : undefined}
                onKeyDown={(ev) => { if (disponible && (ev.key === "Enter" || ev.key === " ")) reservar(e); }}
              >
                <div className="ge-imagen">
                  <img src={imagenEspacio(e)} alt={e.nombre} loading="lazy" onError={usarImagenDeRespaldo(e)} />
                  {!disponible && <span className="ge-estado ge-estado-mantenimiento">En mantenimiento</span>}
                </div>
                <div className="ge-cuerpo">
                  <span className="ge-deporte">{e.deporte}</span>
                  <h3 className="ge-nombre">{e.nombre}</h3>
                  {e.descripcion && <p className="ge-descripcion">{e.descripcion}</p>}
                  <ul className="ge-datos">
                    <li><BsCashCoin /> {pesos(e.tarifaHora)} / hora</li>
                    <li><BsPeople /> Hasta {e.capacidad} personas</li>
                    <li><BsClock /> {hhmm(e.horaApertura)} – {hhmm(e.horaCierre)}</li>
                  </ul>
                  <span className={`btn-gb btn-gb-sm w-100 ge-cta ${disponible ? "btn-gb-primary" : "btn-gb-secondary"}`}>
                    {disponible ? "Reservar" : "No disponible"}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ReservasDCatalogo;
