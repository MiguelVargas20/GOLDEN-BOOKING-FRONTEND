import "../../styles/PanelAdmin.css";

// Etiqueta de color para el estado de una reserva (hotel o deporte).
const ETIQUETAS = {
  PENDIENTE: "Pendiente",
  CONFIRMADA: "Confirmada",
  CANCELADA: "Cancelada",
  FINALIZADA: "Finalizada",
};

export default function EstadoReservaBadge({ estado }) {
  const valor = estado || "PENDIENTE";
  return (
    <span className={`gb-estado gb-estado-${valor.toLowerCase()}`}>
      {ETIQUETAS[valor] || valor}
    </span>
  );
}
