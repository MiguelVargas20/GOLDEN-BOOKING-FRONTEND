import { BsCalendarEvent, BsGeoAlt, BsPeople } from "react-icons/bs";
import { CATEGORIAS_EVENTO, imagenEvento } from "../utils";
import { fechaHora, hora, pesos } from "../../../shared/utils/formato";

/** Tarjeta de un evento para el cliente (portada y página de eventos). */
export default function TarjetaEvento({ evento, compacta = false }) {
  const mismoDia = evento.fechaInicio.slice(0, 10) === evento.fechaFin.slice(0, 10);
  return (
    <article className={`ev-card ${compacta ? "ev-card-compacta" : ""}`}>
      <div className="ev-card-imagen">
        <img src={imagenEvento(evento)} alt="" loading="lazy" />
        <span className="ev-categoria">{CATEGORIAS_EVENTO[evento.categoria]}</span>
        {evento.nuevo && <span className="ev-nuevo">Nuevo</span>}
      </div>
      <div className="ev-card-cuerpo">
        <h3 className="ev-titulo">{evento.titulo}</h3>
        <p className="ev-dato">
          <BsCalendarEvent /> {fechaHora(evento.fechaInicio)} – {mismoDia ? hora(evento.fechaFin) : fechaHora(evento.fechaFin)}
        </p>
        <p className="ev-dato"><BsGeoAlt /> {evento.lugar}</p>
        {!compacta && evento.descripcion && <p className="ev-descripcion">{evento.descripcion}</p>}
        <div className="ev-pie">
          <span className="ev-precio">{evento.precio ? pesos(evento.precio) : "Entrada libre"}</span>
          {evento.cupo && <span className="ev-dato m-0"><BsPeople /> {evento.cupo} cupos</span>}
        </div>
      </div>
    </article>
  );
}
