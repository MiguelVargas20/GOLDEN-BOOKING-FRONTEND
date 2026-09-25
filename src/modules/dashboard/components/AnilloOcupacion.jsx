import { useCuentaAnimada } from "../hooks/useCuentaAnimada";

const RADIO = 52;
const CIRCUNFERENCIA = 2 * Math.PI * RADIO;

/**
 * Porcentaje de ocupación de hoy (habitaciones ocupadas sobre las que se
 * pueden usar, es decir, sin contar las que están en mantenimiento).
 */
export default function AnilloOcupacion({ ocupadas, pendientes, total, mantenimiento }) {
  const utilizables = Math.max(0, total - mantenimiento);
  const porcentaje = utilizables === 0 ? 0 : (ocupadas / utilizables) * 100;
  const animado = useCuentaAnimada(porcentaje, 1200);
  const conPendientes = utilizables === 0 ? 0 : ((ocupadas + pendientes) / utilizables) * 100;

  return (
    <div className="db-anillo">
      <svg viewBox="0 0 128 128" role="img" aria-label={`Ocupación de hoy: ${Math.round(porcentaje)}%`}>
        <circle className="db-anillo-fondo" cx="64" cy="64" r={RADIO} />
        {/* Las reservas aún sin aprobar se muestran como "posible" ocupación */}
        <circle className="db-anillo-pendiente" cx="64" cy="64" r={RADIO}
          strokeDasharray={CIRCUNFERENCIA} strokeDashoffset={CIRCUNFERENCIA * (1 - Math.min(100, conPendientes) / 100)} />
        <circle className="db-anillo-valor" cx="64" cy="64" r={RADIO}
          strokeDasharray={CIRCUNFERENCIA} strokeDashoffset={CIRCUNFERENCIA * (1 - Math.min(100, animado) / 100)} />
      </svg>
      <div className="db-anillo-centro">
        <strong>{Math.round(animado)}%</strong>
        <span>ocupación</span>
      </div>
    </div>
  );
}
