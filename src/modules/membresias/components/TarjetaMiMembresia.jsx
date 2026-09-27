import { Link } from "react-router-dom";
import { BsAward, BsCheck2, BsWallet2 } from "react-icons/bs";
import { useMiMembresia, NOMBRE_MEMBRESIA } from "../hooks/useMiMembresia";
import "../styles/Membresias.css";

/**
 * "Mi membresía" en el perfil del cliente: su categoría, los beneficios que
 * tiene y cuánto le falta para que el club lo considere socio.
 */
export default function TarjetaMiMembresia() {
  const m = useMiMembresia();
  if (!m) return null;

  const esSocio = m.membresia !== "NINGUNA";
  const avance = Math.min(100, Math.round((m.reservas / Math.max(1, m.reservasParaSugerir)) * 100));
  const faltan = Math.max(0, m.reservasParaSugerir - m.reservas);

  return (
    <div className="mm-tarjeta mt-4" data-testid="mi-membresia">
      <div className="mm-cabecera">
        <span className="mm-icono"><BsAward /></span>
        <div>
          <h2>{NOMBRE_MEMBRESIA[m.membresia]}</h2>
          <small>{m.reservas} {m.reservas === 1 ? "reserva realizada" : "reservas realizadas"}</small>
        </div>
      </div>

      <ul className="mm-beneficios">
        {m.descuento > 0 && <li><BsCheck2 /> {m.descuento}% de descuento en cada reserva</li>}
        <li><BsCheck2 /> Reservas con hasta {m.diasAnticipacion} días de anticipación</li>
        {esSocio && m.otrosBeneficios && <li><BsCheck2 /> {m.otrosBeneficios}</li>}
      </ul>

      {esSocio ? (
        <Link to="/mi-cuenta" className="btn-gb btn-gb-secondary btn-gb-sm"><BsWallet2 /> Ver mi cuenta de consumos</Link>
      ) : (
        <>
          <div className="mm-progreso" role="progressbar" aria-valuenow={avance} aria-valuemin={0} aria-valuemax={100} aria-label="Avance para ser socio">
            <div style={{ width: `${avance}%` }} />
          </div>
          <p className="mm-ayuda">
            {faltan > 0
              ? `Te faltan ${faltan} ${faltan === 1 ? "reserva" : "reservas"} para que el club te proponga ser socio.`
              : "¡Ya cumples el requisito! El club revisará tu cuenta para hacerte socio."}
          </p>
          <div className="mm-categorias">
            <div><strong>Socio Ocasional</strong>{m.ocasional.descuento}% de descuento · {m.ocasional.diasAnticipacion} días de anticipación</div>
            <div><strong>Socio Miembro</strong>{m.miembro.descuento}% de descuento · {m.miembro.diasAnticipacion} días de anticipación</div>
          </div>
        </>
      )}
    </div>
  );
}
