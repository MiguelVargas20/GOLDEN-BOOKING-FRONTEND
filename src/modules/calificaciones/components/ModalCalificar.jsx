import { useState } from "react";
import { Modal, Form, Spinner } from "react-bootstrap";
import { BsStarFill, BsStar } from "react-icons/bs";
import "../styles/Calificaciones.css";

const TEXTOS = ["", "Muy malo", "Malo", "Regular", "Bueno", "Excelente"];

/**
 * Calificar una reserva finalizada: de 1 a 5 estrellas y un comentario opcional.
 * @param {string} lugar - "Cancha de Tenis 1" o "Habitación 101"
 * @param {(puntuacion: number, comentario: string) => Promise} onGuardar
 */
export default function ModalCalificar({ lugar, onCerrar, onGuardar }) {
  const [puntuacion, setPuntuacion] = useState(0);
  const [resaltada, setResaltada] = useState(0);
  const [comentario, setComentario] = useState("");
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const guardar = async (e) => {
    e.preventDefault();
    if (!puntuacion) return setError("Elige de 1 a 5 estrellas.");
    setGuardando(true);
    setError(null);
    try {
      await onGuardar(puntuacion, comentario.trim());
    } catch (err) {
      setError(err.message || "No se pudo guardar la calificación.");
    } finally {
      setGuardando(false);
    }
  };

  const mostrada = resaltada || puntuacion;

  return (
    <Modal show onHide={onCerrar} centered>
      <Form onSubmit={guardar} className="gb-form">
        <Modal.Header closeButton>
          <Modal.Title>Califica tu experiencia</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="gb-ayuda mb-2">¿Cómo te fue en <strong>{lugar}</strong>?</p>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <div className="cal-selector" role="radiogroup" aria-label="Calificación" onMouseLeave={() => setResaltada(0)}>
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} type="button" role="radio" aria-checked={puntuacion === i}
                aria-label={`${i} ${i === 1 ? "estrella" : "estrellas"}`}
                className={i <= mostrada ? "activa" : ""}
                onMouseEnter={() => setResaltada(i)} onClick={() => setPuntuacion(i)}>
                {i <= mostrada ? <BsStarFill /> : <BsStar />}
              </button>
            ))}
            <span className="cal-selector-texto">{TEXTOS[mostrada]}</span>
          </div>
          <Form.Label htmlFor="cal-comentario" className="mt-3">Comentario (opcional)</Form.Label>
          <Form.Control id="cal-comentario" as="textarea" rows={3} maxLength={500} value={comentario}
            placeholder="Cuéntanos qué te gustó o qué podemos mejorar" onChange={(e) => setComentario(e.target.value)} />
          <span className="gb-ayuda">{comentario.length}/500</span>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn-gb btn-gb-secondary" onClick={onCerrar} disabled={guardando}>Ahora no</button>
          <button type="submit" className="btn-gb btn-gb-primary" disabled={guardando}>
            {guardando ? <><Spinner size="sm" /> Enviando…</> : "Enviar calificación"}
          </button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
