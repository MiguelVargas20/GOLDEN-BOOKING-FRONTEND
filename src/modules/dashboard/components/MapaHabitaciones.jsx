import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsCheckCircleFill, BsPersonFill, BsHourglassSplit, BsTools } from "react-icons/bs";
import { fecha } from "../../../shared/utils/formato";

// Cada estado lleva color + ícono + texto (nunca solo el color)
const ESTADOS_HABITACION = {
  DISPONIBLE: { etiqueta: "Disponible", icono: <BsCheckCircleFill />, clase: "disponible" },
  OCUPADA: { etiqueta: "Ocupada", icono: <BsPersonFill />, clase: "ocupada" },
  RESERVADA_PENDIENTE: { etiqueta: "Por aprobar", icono: <BsHourglassSplit />, clase: "pendiente" },
  MANTENIMIENTO: { etiqueta: "Mantenimiento", icono: <BsTools />, clase: "mantenimiento" },
};

/** Estado de cada habitación hoy, filtrable por estado y con detalle al seleccionar. */
export default function MapaHabitaciones({ habitaciones }) {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState(null);
  const [seleccion, setSeleccion] = useState(null);

  const conteo = habitaciones.reduce((acc, h) => ({ ...acc, [h.estadoHoy]: (acc[h.estadoHoy] || 0) + 1 }), {});
  const elegida = habitaciones.find((h) => h.id === seleccion);

  if (habitaciones.length === 0) {
    return <p className="db-vacio">No hay habitaciones registradas.</p>;
  }

  return (
    <>
      <div className="db-filtros" role="group" aria-label="Filtrar habitaciones por estado">
        {Object.entries(ESTADOS_HABITACION).map(([clave, e]) => (
          <button
            key={clave}
            type="button"
            className={`db-filtro db-hab-${e.clase} ${filtro === clave ? "activo" : ""}`}
            onClick={() => setFiltro((f) => (f === clave ? null : clave))}
            aria-pressed={filtro === clave}
          >
            {e.icono} {e.etiqueta} <b>{conteo[clave] || 0}</b>
          </button>
        ))}
      </div>

      <div className="db-habitaciones">
        {habitaciones.map((h, i) => {
          const e = ESTADOS_HABITACION[h.estadoHoy] || ESTADOS_HABITACION.DISPONIBLE;
          const oculta = filtro && filtro !== h.estadoHoy;
          return (
            <button
              key={h.id}
              type="button"
              className={`db-hab db-hab-${e.clase} ${oculta ? "oculta" : ""} ${seleccion === h.id ? "seleccionada" : ""}`}
              style={{ "--retraso": `${Math.min(i, 30) * 25}ms` }}
              onClick={() => setSeleccion((s) => (s === h.id ? null : h.id))}
              title={`Habitación ${h.numero} · ${e.etiqueta}${h.huesped ? ` · ${h.huesped}` : ""}`}
              aria-label={`Habitación ${h.numero}, ${e.etiqueta}`}
            >
              <span className="db-hab-numero">{h.numero}</span>
              <span className="db-hab-icono">{e.icono}</span>
            </button>
          );
        })}
      </div>

      {elegida && (
        <div className="db-hab-detalle db-aparecer">
          <div>
            <strong>Habitación {elegida.numero}</strong>
            {elegida.tipo && <span className="db-muted"> · {elegida.tipo}</span>}
            <div className={`db-hab-estado db-hab-${ESTADOS_HABITACION[elegida.estadoHoy]?.clase}`}>
              {ESTADOS_HABITACION[elegida.estadoHoy]?.icono} {ESTADOS_HABITACION[elegida.estadoHoy]?.etiqueta}
            </div>
            {elegida.huesped && (
              <div className="db-muted">Huésped: <b>{elegida.huesped}</b> · sale el {fecha(elegida.hasta)}</div>
            )}
          </div>
          <button type="button" className="btn-gb btn-gb-neutral btn-gb-sm" onClick={() => navigate(`/detalle/${elegida.id}`)}>
            Ver habitación
          </button>
        </div>
      )}
    </>
  );
}
