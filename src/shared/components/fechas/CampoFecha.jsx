import DatePicker, { registerLocale } from "react-datepicker";
import { es } from "date-fns/locale";
import { BsCalendar3 } from "react-icons/bs";
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/DatePickerCompartido.css";
import { aFecha, aTextoFecha } from "../../utils/fechas";

registerLocale("es", es);

/**
 * Campo de fecha con el calendario de la app (el mismo en todas las pantallas).
 * Trabaja con texto "yyyy-MM-dd" para no correr la fecha por la zona horaria.
 *
 * @param {string} valor - "yyyy-MM-dd" o ""
 * @param {(fecha: string) => void} onCambio
 * @param {string} [min] / [max] - límites "yyyy-MM-dd"
 * @param {Array<{start: Date, end: Date}>} [excluir] - días ocupados
 * @param {boolean} [portal] - abrir el calendario sobre toda la página (tarjetas con overflow)
 */
export default function CampoFecha({
  id, valor, onCambio, min, max, excluir, placeholder = "Elige una fecha", disabled = false, portal = false,
}) {
  return (
    <div className={`gb-fecha ${disabled ? "deshabilitado" : ""}`}>
      <BsCalendar3 className="gb-fecha-icono" aria-hidden="true" />
      <DatePicker
        id={id}
        selected={valor ? aFecha(valor) : null}
        onChange={(d) => onCambio(d ? aTextoFecha(d) : "")}
        dateFormat="dd/MM/yyyy"
        locale="es"
        minDate={min ? aFecha(min) : undefined}
        maxDate={max ? aFecha(max) : undefined}
        excludeDateIntervals={excluir}
        placeholderText={placeholder}
        className="form-control gb-fecha-input"
        calendarClassName="gb-calendario"
        popperClassName="gb-calendario-popper"
        popperProps={{ strategy: "fixed" }}
        portalId={portal ? "gb-calendario-portal" : undefined}
        showPopperArrow={false}
        disabled={disabled}
        autoComplete="off"
      />
    </div>
  );
}
