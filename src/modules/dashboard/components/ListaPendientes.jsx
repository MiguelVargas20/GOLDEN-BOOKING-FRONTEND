import { MdSportsTennis, MdKingBed } from "react-icons/md";
import { BsCheckLg, BsXLg } from "react-icons/bs";
import { fechaHora, fecha, pesos } from "../../../shared/utils/formato";

/**
 * Reservas por aprobar más próximas, con aprobar / cancelar en la misma fila.
 * `procesando` es el id de la reserva que se está actualizando.
 */
export default function ListaPendientes({ pendientes, onAprobar, onCancelar, procesando }) {
  if (pendientes.length === 0) {
    return (
      <div className="db-todo-listo">
        <BsCheckLg />
        <p>¡Todo al día! No hay reservas esperando aprobación.</p>
      </div>
    );
  }

  return (
    <ul className="db-pendientes">
      {pendientes.map((p, i) => {
        const esDeporte = p.tipo === "DEPORTE";
        const ocupada = procesando === p.idReserva;
        return (
          <li key={`${p.tipo}-${p.idReserva}`} className={`db-pendiente db-aparecer ${ocupada ? "procesando" : ""}`}
            style={{ "--retraso": `${i * 50}ms` }}>
            <span className={`db-pendiente-icono db-tipo-${esDeporte ? "deporte" : "checkin"}`}>
              {esDeporte ? <MdSportsTennis /> : <MdKingBed />}
            </span>
            <div className="db-pendiente-cuerpo">
              <strong>{p.cliente}</strong>
              <span className="db-muted">
                {p.lugar} · {esDeporte ? fechaHora(p.inicio) : `${fecha(p.inicio)} → ${fecha(p.fin)}`}
              </span>
              {p.total != null && <span className="db-pendiente-total">{pesos(p.total)}</span>}
            </div>
            <div className="db-pendiente-acciones">
              <button type="button" className="db-accion aprobar" disabled={ocupada}
                onClick={() => onAprobar(p)} aria-label={`Aprobar reserva de ${p.cliente}`} title="Aprobar">
                <BsCheckLg />
              </button>
              <button type="button" className="db-accion cancelar" disabled={ocupada}
                onClick={() => onCancelar(p)} aria-label={`Cancelar reserva de ${p.cliente}`} title="Cancelar">
                <BsXLg />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
