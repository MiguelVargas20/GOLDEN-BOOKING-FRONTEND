import { useState } from "react";
import { MdSportsTennis } from "react-icons/md";
import { BsBoxArrowInRight, BsBoxArrowRight } from "react-icons/bs";
import EstadoReservaBadge from "../../../shared/components/reservas/EstadoReservaBadge";
import { hora } from "../../../shared/utils/formato";

const TIPOS = {
  DEPORTE: { etiqueta: "Deporte", icono: <MdSportsTennis />, clase: "deporte" },
  CHECK_IN: { etiqueta: "Check-in", icono: <BsBoxArrowInRight />, clase: "checkin" },
  CHECK_OUT: { etiqueta: "Check-out", icono: <BsBoxArrowRight />, clase: "checkout" },
};

const FILTROS = [
  { clave: "TODOS", etiqueta: "Todo" },
  { clave: "DEPORTE", etiqueta: "Deporte" },
  { clave: "HOTEL", etiqueta: "Hotel" },
];

/**
 * Línea de tiempo de hoy. Lo que ya pasó se atenúa y una marca indica la
 * hora actual (`ahora`, en ms, lo pasa la página al cargar los datos).
 */
export default function AgendaHoy({ eventos, ahora }) {
  const [filtro, setFiltro] = useState("TODOS");
  const visibles = eventos.filter((e) =>
    filtro === "TODOS" || (filtro === "DEPORTE" ? e.tipo === "DEPORTE" : e.tipo !== "DEPORTE"));
  // posición de la marca "ahora": antes del primer evento que aún no pasa
  const indiceAhora = visibles.findIndex((e) => new Date(e.hora).getTime() > ahora);

  return (
    <>
      <div className="db-filtros db-filtros-compactos" role="group" aria-label="Filtrar agenda">
        {FILTROS.map((f) => (
          <button key={f.clave} type="button" className={`db-filtro ${filtro === f.clave ? "activo" : ""}`}
            onClick={() => setFiltro(f.clave)} aria-pressed={filtro === f.clave}>
            {f.etiqueta}
          </button>
        ))}
      </div>

      {visibles.length === 0 ? (
        <p className="db-vacio">Nada programado para hoy.</p>
      ) : (
        <ol className="db-agenda">
          {visibles.map((e, i) => {
            const t = TIPOS[e.tipo];
            const pasado = new Date(e.fin || e.hora).getTime() < ahora;
            return (
              <li key={`${e.tipo}-${e.idReserva}`} className={`db-agenda-item db-aparecer ${pasado ? "pasado" : ""}`}
                style={{ "--retraso": `${i * 50}ms` }}>
                {i === indiceAhora && <div className="db-ahora"><span>Ahora</span></div>}
                <time className="db-agenda-hora">
                  {hora(e.hora)}{e.fin && <small>– {hora(e.fin)}</small>}
                </time>
                <span className={`db-agenda-punto db-tipo-${t.clase}`}>{t.icono}</span>
                <div className="db-agenda-cuerpo">
                  <strong>{e.lugar}</strong>
                  <span className="db-muted">{t.etiqueta} · {e.cliente}</span>
                </div>
                <EstadoReservaBadge estado={e.estado} />
              </li>
            );
          })}
          {indiceAhora === -1 && <li className="db-ahora db-ahora-final"><span>Ahora</span></li>}
        </ol>
      )}
    </>
  );
}
