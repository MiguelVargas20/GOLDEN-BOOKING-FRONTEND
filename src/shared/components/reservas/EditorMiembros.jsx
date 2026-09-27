import { BsPersonPlus, BsTrash } from "react-icons/bs";
import { TIPOS_DOC_MIEMBRO } from "../../utils/miembros";
import "./EditorMiembros.css";

const VACIO = { nombre: "", tipoDocumento: "CC", numeroDocumento: "" };

/**
 * Acompañantes de una reserva: nombre, tipo de documento (los menores con
 * tarjeta de identidad) y número.
 * @param {number} maximo - cupos para acompañantes (capacidad - 1)
 */
export default function EditorMiembros({ miembros, onCambio, maximo, deshabilitado = false }) {
  const cambiar = (i, campo, valor) => onCambio(miembros.map((m, j) => (j === i ? { ...m, [campo]: valor } : m)));
  const quitar = (i) => onCambio(miembros.filter((_, j) => j !== i));
  const lleno = maximo !== undefined && miembros.length >= maximo;

  return (
    <div className="em">
      {miembros.length === 0 && <p className="em-vacio">Vas solo. Si vienes con alguien, agrégalo para que quede registrado.</p>}
      {miembros.map((m, i) => (
        <div key={i} className="em-fila" data-miembro={i}>
          <input className="form-control" placeholder="Nombre completo" aria-label={`Nombre del acompañante ${i + 1}`}
            value={m.nombre} maxLength={80} onChange={(e) => cambiar(i, "nombre", e.target.value)} disabled={deshabilitado} />
          <select className="form-select" aria-label={`Tipo de documento del acompañante ${i + 1}`}
            value={m.tipoDocumento} onChange={(e) => cambiar(i, "tipoDocumento", e.target.value)} disabled={deshabilitado}>
            {Object.entries(TIPOS_DOC_MIEMBRO).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
          </select>
          <input className="form-control" placeholder="Número de documento" inputMode="numeric" maxLength={15}
            aria-label={`Documento del acompañante ${i + 1}`} value={m.numeroDocumento}
            onChange={(e) => cambiar(i, "numeroDocumento", e.target.value.replace(/\s/g, ""))} disabled={deshabilitado} />
          <button type="button" className="em-quitar" onClick={() => quitar(i)} aria-label={`Quitar acompañante ${i + 1}`} disabled={deshabilitado}>
            <BsTrash />
          </button>
        </div>
      ))}
      <button type="button" className="btn-gb btn-gb-neutral btn-gb-sm em-agregar" disabled={lleno || deshabilitado}
        onClick={() => onCambio([...miembros, { ...VACIO }])}>
        <BsPersonPlus /> Agregar acompañante
      </button>
      {maximo !== undefined && (
        <span className="em-cupos">{lleno ? "Llegaste al máximo de acompañantes." : `Puedes agregar hasta ${maximo} ${maximo === 1 ? "acompañante" : "acompañantes"}.`}</span>
      )}
    </div>
  );
}
