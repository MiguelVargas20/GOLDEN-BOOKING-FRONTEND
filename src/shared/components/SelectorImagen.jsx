import { useEffect, useRef, useState } from "react";
import { BsImage, BsTrash, BsUpload } from "react-icons/bs";
import { validarImagen, REGLAS_IMAGEN } from "../utils/imagenes";
import "../styles/SelectorImagen.css";

/**
 * Selector de imagen con vista previa y validación antes de subir
 * (formato, peso y dimensiones, igual que el backend).
 *
 * @param {string|null} imagenActual URL de la imagen que ya tiene (o null)
 * @param {(archivo: File|null) => void} onCambio archivo elegido (null = ninguno)
 * @param {() => void} [onQuitar] si se pasa, muestra "Quitar imagen" para la actual
 */
export default function SelectorImagen({ imagenActual = null, onCambio, onQuitar, deshabilitado = false }) {
  const entrada = useRef(null);
  const [vistaPrevia, setVistaPrevia] = useState(null);
  const [error, setError] = useState(null);

  // Libera la URL temporal de la vista previa
  useEffect(() => () => { if (vistaPrevia) URL.revokeObjectURL(vistaPrevia); }, [vistaPrevia]);

  const elegir = async (e) => {
    const archivo = e.target.files?.[0];
    e.target.value = ""; // permite volver a elegir el mismo archivo
    if (!archivo) return;
    const problema = await validarImagen(archivo);
    if (problema) {
      setError(problema);
      return;
    }
    setError(null);
    setVistaPrevia(URL.createObjectURL(archivo));
    onCambio(archivo);
  };

  const descartar = () => {
    setVistaPrevia(null);
    setError(null);
    onCambio(null);
  };

  const mostrada = vistaPrevia || imagenActual;

  return (
    <div className="gb-selector-imagen">
      <button type="button" className={`gb-selector-imagen-marco ${mostrada ? "con-imagen" : ""}`}
        onClick={() => entrada.current?.click()} disabled={deshabilitado} aria-label="Elegir imagen">
        {mostrada
          ? <img src={mostrada} alt="Vista previa" />
          : <span className="gb-selector-imagen-vacio"><BsImage /> Haz clic para elegir una imagen</span>}
      </button>

      <input ref={entrada} type="file" accept={REGLAS_IMAGEN.tipos.join(",")} hidden onChange={elegir} />

      <div className="gb-selector-imagen-acciones">
        <button type="button" className="btn-gb btn-gb-neutral btn-gb-sm" onClick={() => entrada.current?.click()} disabled={deshabilitado}>
          <BsUpload /> {mostrada ? "Cambiar" : "Elegir imagen"}
        </button>
        {vistaPrevia && (
          <button type="button" className="btn-gb btn-gb-secondary btn-gb-sm" onClick={descartar} disabled={deshabilitado}>
            Descartar
          </button>
        )}
        {!vistaPrevia && imagenActual && onQuitar && (
          <button type="button" className="btn-gb btn-gb-danger btn-gb-sm" onClick={onQuitar} disabled={deshabilitado}>
            <BsTrash /> Quitar imagen
          </button>
        )}
      </div>

      <small className="gb-selector-imagen-ayuda">
        JPG, PNG o WEBP · máx. 5 MB · mínimo {REGLAS_IMAGEN.anchoMinimo}×{REGLAS_IMAGEN.altoMinimo} px
      </small>
      {error && <div className="gb-selector-imagen-error" role="alert">{error}</div>}
    </div>
  );
}
