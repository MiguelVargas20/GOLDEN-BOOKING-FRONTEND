import { BsStarFill, BsStarHalf, BsStar } from "react-icons/bs";
import "../styles/Calificaciones.css";

/** Estrellas de solo lectura (admite medias estrellas). */
export function Estrellas({ valor, total }) {
  const redondeado = Math.round(valor * 2) / 2;
  return (
    <span className="cal-estrellas" aria-label={`${valor} de 5 estrellas`} title={`${valor} de 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        redondeado >= i ? <BsStarFill key={i} /> : redondeado >= i - 0.5 ? <BsStarHalf key={i} /> : <BsStar key={i} />
      ))}
      {total !== undefined && <span className="cal-total">{valor.toFixed(1)} ({total})</span>}
    </span>
  );
}

/** Promedio de un espacio o habitación para las tarjetas del catálogo ("Sin calificaciones" si no hay). */
export function PromedioCalificacion({ resumen }) {
  if (!resumen) return <span className="cal-sin">Sin calificaciones aún</span>;
  return <Estrellas valor={resumen.promedio} total={resumen.total} />;
}
