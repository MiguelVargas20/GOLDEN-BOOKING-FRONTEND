import { useEffect, useState } from "react";
import { listarOpiniones } from "../api/CalificacionApi";
import { fecha } from "../../../shared/utils/formato";
import { Estrellas } from "./Estrellas";
import "../styles/Calificaciones.css";

/** Opiniones de los clientes sobre un espacio o una habitación. */
export default function Opiniones({ categoria, idRecurso }) {
  const [opiniones, setOpiniones] = useState(null);

  useEffect(() => {
    if (!idRecurso) return;
    listarOpiniones(categoria, idRecurso).then(setOpiniones).catch(() => setOpiniones([]));
  }, [categoria, idRecurso]);

  if (!opiniones) return null;
  const promedio = opiniones.length ? opiniones.reduce((s, o) => s + o.puntuacion, 0) / opiniones.length : 0;

  return (
    <div className="gb-tarjeta cal-opiniones">
      <h2 className="gb-seccion-titulo">Opiniones de los clientes</h2>
      {opiniones.length === 0 ? (
        <p className="gb-ayuda m-0">Todavía no hay opiniones. ¡Reserva y sé el primero en calificar!</p>
      ) : (
        <>
          <div className="cal-promedio"><Estrellas valor={Math.round(promedio * 10) / 10} total={opiniones.length} /></div>
          <ul className="cal-lista">
            {opiniones.map((o) => (
              <li key={o.id}>
                <div className="cal-lista-cabecera">
                  <strong>{o.nombreCliente}</strong>
                  <Estrellas valor={o.puntuacion} />
                  <span className="gb-ayuda">{fecha(o.fecha)}</span>
                </div>
                {o.comentario && <p className="m-0">{o.comentario}</p>}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
