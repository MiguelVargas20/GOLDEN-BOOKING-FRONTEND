import { BsHourglassSplit, BsCheckCircle, BsXCircle, BsFlag, BsListUl } from "react-icons/bs";
import "../../styles/PanelAdmin.css";

const TARJETAS = [
  { estado: null, titulo: "Todas", icono: <BsListUl />, clase: "todas" },
  { estado: "PENDIENTE", titulo: "Pendientes", icono: <BsHourglassSplit />, clase: "pendiente" },
  { estado: "CONFIRMADA", titulo: "Confirmadas", icono: <BsCheckCircle />, clase: "confirmada" },
  { estado: "CANCELADA", titulo: "Canceladas", icono: <BsXCircle />, clase: "cancelada" },
  { estado: "FINALIZADA", titulo: "Finalizadas", icono: <BsFlag />, clase: "finalizada" },
];

/**
 * Indicadores del panel de reservas del admin. Cada tarjeta muestra la
 * cantidad de reservas en ese estado y, al hacer clic, filtra la tabla.
 *
 * @param {Object} resumen - { PENDIENTE: n, CONFIRMADA: n, ... } (GET /resumen)
 * @param {string|null} filtro - estado seleccionado (null = todas)
 * @param {Function} onFiltrar - recibe el estado elegido
 */
export default function ResumenEstados({ resumen, filtro, onFiltrar }) {
  const total = Object.values(resumen || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="gb-kpis">
      {TARJETAS.map((t) => (
        <button
          key={t.clase}
          type="button"
          className={`gb-kpi gb-kpi-${t.clase} ${filtro === t.estado ? "activa" : ""}`}
          onClick={() => onFiltrar(t.estado)}
        >
          <span className="gb-kpi-icono">{t.icono}</span>
          <span className="gb-kpi-valor">{t.estado ? resumen?.[t.estado] ?? 0 : total}</span>
          <span className="gb-kpi-titulo">{t.titulo}</span>
        </button>
      ))}
    </div>
  );
}
