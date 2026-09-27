import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import { BsStars } from "react-icons/bs";
import { listarProximosEventos } from "../api/EventoApi";
import TarjetaEvento from "./TarjetaEvento";
import "../styles/Eventos.css";

/**
 * Sección "Próximos eventos" arriba en la portada del cliente.
 * Si no hay eventos publicados (o falla la carga) no ocupa espacio.
 */
export default function ProximosEventos({ maximo = 3 }) {
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    listarProximosEventos().then(setEventos).catch(() => setEventos([]));
  }, []);

  if (eventos.length === 0) return null;
  const nuevos = eventos.filter((e) => e.nuevo).length;

  return (
    <section className="ev-home" aria-labelledby="ev-home-titulo">
      <Container>
        <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-3">
          <div>
            <span className="text-orange fw-bold small d-inline-flex align-items-center gap-1">
              <BsStars /> {nuevos > 0 ? `${nuevos} ${nuevos === 1 ? "evento nuevo" : "eventos nuevos"}` : "Agenda del club"}
            </span>
            <h2 id="ev-home-titulo" className="bungee-regular m-0">PRÓXIMOS EVENTOS</h2>
          </div>
          <Link to="/eventos" className="text-orange fw-bold text-decoration-none small">Ver todos los eventos →</Link>
        </div>
        <div className="ev-grid">
          {eventos.slice(0, maximo).map((ev) => <TarjetaEvento key={ev.id} evento={ev} compacta />)}
        </div>
      </Container>
    </section>
  );
}
