import { useRef, useState } from "react";
import { Spinner } from "react-bootstrap";
import { BsPlusLg, BsStar, BsStarFill, BsTrash } from "react-icons/bs";
import { agregarImagenHabitacion, quitarImagenGaleria, elegirPortadaHabitacion } from "../api/HabitacionApi";
import { validarImagen, REGLAS_IMAGEN } from "../../../shared/utils/imagenes";
import { API_URL } from "../../../shared/api/apiUtils";
import "../styles/GaleriaHabitacion.css";

const MAXIMO = 5;

/**
 * Galería de la habitación (hasta 5 fotos). Los cambios se guardan al
 * instante; la primera foto es la portada del catálogo.
 * @param {Object} habitacion
 * @param {(habitacionActualizada) => void} onCambio
 */
export default function GaleriaHabitacion({ habitacion, onCambio }) {
  const entrada = useRef(null);
  const [trabajando, setTrabajando] = useState(null);
  const [error, setError] = useState(null);
  const imagenes = habitacion.imagenes || [];

  const ejecutar = async (clave, accion) => {
    setTrabajando(clave);
    setError(null);
    try {
      onCambio(await accion());
    } catch (err) {
      setError(err.message);
    } finally {
      setTrabajando(null);
    }
  };

  const elegir = async (e) => {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;
    const problema = await validarImagen(archivo);
    if (problema) return setError(problema);
    ejecutar("subir", () => agregarImagenHabitacion(habitacion.id, archivo));
  };

  return (
    <div className="gal">
      <div className="gal-grilla">
        {imagenes.map((img, i) => (
          <figure key={img.id} className={`gal-foto ${i === 0 ? "portada" : ""}`}>
            <img src={`${API_URL}${img.url}`} alt={`Foto ${i + 1}`} />
            {i === 0 && <span className="gal-etiqueta">Portada</span>}
            <div className="gal-acciones">
              <button type="button" title={i === 0 ? "Es la portada" : "Usar como portada"} aria-label={`Usar la foto ${i + 1} como portada`}
                disabled={i === 0 || Boolean(trabajando)} onClick={() => ejecutar(img.id, () => elegirPortadaHabitacion(habitacion.id, img.id))}>
                {i === 0 ? <BsStarFill /> : <BsStar />}
              </button>
              <button type="button" title="Quitar" aria-label={`Quitar la foto ${i + 1}`} disabled={Boolean(trabajando)}
                onClick={() => ejecutar(img.id, () => quitarImagenGaleria(habitacion.id, img.id))}>
                {trabajando === img.id ? <Spinner size="sm" /> : <BsTrash />}
              </button>
            </div>
          </figure>
        ))}
        {imagenes.length < MAXIMO && (
          <button type="button" className="gal-agregar" onClick={() => entrada.current?.click()} disabled={Boolean(trabajando)}>
            {trabajando === "subir" ? <Spinner size="sm" /> : <BsPlusLg />}
            <span>Agregar foto</span>
          </button>
        )}
      </div>
      <input ref={entrada} type="file" accept={REGLAS_IMAGEN.tipos.join(",")} hidden onChange={elegir} aria-label="Elegir foto" />
      {error && <div className="alert alert-danger py-2 mt-2 mb-0">{error}</div>}
      <small className="gal-ayuda">{imagenes.length}/{MAXIMO} fotos · JPG, PNG o WEBP, máx. 5 MB. La primera es la portada del catálogo.</small>
    </div>
  );
}
