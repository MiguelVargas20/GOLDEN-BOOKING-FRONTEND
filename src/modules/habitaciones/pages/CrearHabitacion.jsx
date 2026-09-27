import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Form, Alert, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import { BsArrowLeft, BsPlusLg } from "react-icons/bs";
import { crearHabitacion, listarTiposHabitacion, subirImagenHabitacion } from "../api/HabitacionApi";
import SelectorImagen from "../../../shared/components/SelectorImagen";
import { pesos } from "../../../shared/utils/formato";
import { IMAGEN_HABITACION_POR_DEFECTO, usarImagenDeRespaldoHabitacion } from "../utils/imagenHabitacion";
import "../../../shared/styles/PanelAdmin.css";
import "../../../shared/styles/BotonesCompartidos.css";
import "../styles/CrearHabitacion.css";

// "Ocupada" no se elige aquí: la ocupación sale de las reservas de cada día
const ESTADOS = [
  { value: "DISPONIBLE", label: "Disponible" },
  { value: "MANTENIMIENTO", label: "En mantenimiento (no se puede reservar)" },
];

/**
 * Registro de una habitación (ADMIN): número, tipo, precio, estado,
 * descripción e imagen. La imagen se sube justo después de crearla.
 */
export default function CrearHabitacion() {
  const navigate = useNavigate();

  const [tipos, setTipos] = useState([]);
  const [cargandoTipos, setCargandoTipos] = useState(true);

  const [numeroHabitacion, setNumeroHabitacion] = useState("");
  const [idTipo, setIdTipo] = useState("");
  const [precioNoche, setPrecioNoche] = useState("");
  const [estadoHabitacion, setEstadoHabitacion] = useState("DISPONIBLE");
  const [descripcion, setDescripcion] = useState("");
  const [imagen, setImagen] = useState(null);

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    listarTiposHabitacion()
      .then((data) => {
        setTipos(data);
        if (data.length > 0) setIdTipo(data[0].id);
      })
      .catch(() => setError("No se pudieron cargar los tipos de habitación."))
      .finally(() => setCargandoTipos(false));
  }, []);

  const tipo = tipos.find((t) => t.id === idTipo);

  // URL temporal para la vista previa: una por archivo, liberada al cambiarlo
  const previa = useMemo(() => (imagen ? URL.createObjectURL(imagen) : null), [imagen]);
  useEffect(() => () => { if (previa) URL.revokeObjectURL(previa); }, [previa]);

  const guardar = async (e) => {
    e.preventDefault();
    setError("");
    if (!numeroHabitacion.trim()) return setError("El número de habitación es obligatorio.");
    if (!tipo) return setError("Selecciona un tipo de habitación.");
    if (!precioNoche || Number(precioNoche) <= 0) return setError("Ingresa un precio por noche mayor a cero.");

    setGuardando(true);
    try {
      const creada = await crearHabitacion({
        numeroHabitacion: numeroHabitacion.trim(),
        datosTipoHabitacion: { id: tipo.id }, // el backend completa el tipo desde la base de datos
        precioNoche: Number(precioNoche),
        estadoHabitacion,
        descripcion: descripcion.trim() || null,
      });

      if (imagen) {
        try {
          await subirImagenHabitacion(creada.id, imagen);
        } catch (err) {
          // La habitación ya quedó creada: se avisa y se puede subir luego desde Gestionar
          await Swal.fire({
            icon: "warning",
            title: "Habitación creada sin imagen",
            text: `${err.message} Puedes subirla después desde "Gestionar habitaciones".`,
            confirmButtonColor: "#f38d1e",
          });
          navigate("/habitaciones/gestionar");
          return;
        }
      }

      await Swal.fire({ icon: "success", title: "Habitación registrada", timer: 1500, showConfirmButton: false });
      navigate("/habitaciones/gestionar");
    } catch (err) {
      setError(err.message || "No se pudo registrar la habitación.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="gb-panel">
      <div className="gb-panel-header">
        <div>
          <h1 className="gb-panel-titulo">Crear <span>habitación</span></h1>
          <p className="gb-panel-subtitulo">Registra una habitación nueva en el catálogo del hotel.</p>
        </div>
        <div className="gb-panel-acciones">
          <button type="button" className="btn-gb btn-gb-neutral btn-gb-sm" onClick={() => navigate("/habitaciones/gestionar")}>
            <BsArrowLeft /> Volver
          </button>
        </div>
      </div>

      <Form onSubmit={guardar} noValidate className="gb-form">
        <Row className="g-4">
          <Col lg={8}>
            <div className="gb-tarjeta">
              {error && <Alert variant="danger" className="py-2">{error}</Alert>}

              <h2 className="gb-seccion-titulo">Datos de la habitación</h2>
              <Row className="g-3 mb-3">
                <Col md={4}>
                  <Form.Label htmlFor="hab-numero">Número *</Form.Label>
                  <Form.Control id="hab-numero" placeholder="Ej.: 402-A" maxLength={10}
                    value={numeroHabitacion} onChange={(e) => setNumeroHabitacion(e.target.value)} />
                </Col>
                <Col md={8}>
                  <Form.Label htmlFor="hab-tipo">Tipo *</Form.Label>
                  {cargandoTipos ? (
                    <div className="d-flex align-items-center gap-2 py-2"><Spinner size="sm" /> Cargando tipos…</div>
                  ) : (
                    <div className="d-flex gap-2">
                      <Form.Select id="hab-tipo" value={idTipo} onChange={(e) => setIdTipo(e.target.value)}>
                        {tipos.length === 0 && <option value="">No hay tipos: crea uno primero</option>}
                        {tipos.map((t) => (
                          <option key={t.id} value={t.id}>{t.nombreTipoHabitacion} — hasta {t.capacidadMaxima} personas</option>
                        ))}
                      </Form.Select>
                      <button type="button" className="btn-gb btn-gb-neutral btn-gb-sm" title="Crear tipo de habitación"
                        onClick={() => navigate("/habitaciones/tipos")} aria-label="Crear tipo de habitación">
                        <BsPlusLg />
                      </button>
                    </div>
                  )}
                  {tipo?.descripcion && <span className="gb-ayuda">{tipo.descripcion}</span>}
                </Col>
                <Col md={6}>
                  <Form.Label htmlFor="hab-precio">Precio por noche (COP) *</Form.Label>
                  <Form.Control id="hab-precio" type="number" min={1} step={1} inputMode="numeric" placeholder="180000"
                    value={precioNoche} onChange={(e) => setPrecioNoche(e.target.value)} />
                </Col>
                <Col md={6}>
                  <Form.Label htmlFor="hab-estado">Estado</Form.Label>
                  <Form.Select id="hab-estado" value={estadoHabitacion} onChange={(e) => setEstadoHabitacion(e.target.value)}>
                    {ESTADOS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
                  </Form.Select>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label htmlFor="hab-desc">Descripción</Form.Label>
                <Form.Control id="hab-desc" as="textarea" rows={4} maxLength={500}
                  placeholder="Comodidades, vista, tipo de cama…"
                  value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
                <span className="gb-ayuda">{descripcion.length}/500</span>
              </Form.Group>

              <div className="gb-form-botones">
                <button type="button" className="btn-gb btn-gb-secondary" onClick={() => navigate("/habitaciones/gestionar")} disabled={guardando}>
                  Cancelar
                </button>
                <button type="submit" className="btn-gb btn-gb-primary" disabled={guardando || cargandoTipos}>
                  {guardando ? <><Spinner size="sm" /> Guardando…</> : "Registrar habitación"}
                </button>
              </div>
            </div>
          </Col>

          <Col lg={4}>
            <div className="gb-tarjeta mb-4">
              <h2 className="gb-seccion-titulo">Imagen</h2>
              <SelectorImagen onCambio={setImagen} deshabilitado={guardando} />
            </div>

            {/* Así se verá en el catálogo */}
            <div className="gb-tarjeta ch-vista-previa">
              <h2 className="gb-seccion-titulo">Vista previa</h2>
              <div className="ch-previa-imagen">
                <img src={previa || IMAGEN_HABITACION_POR_DEFECTO} alt="" onError={usarImagenDeRespaldoHabitacion} />
                <span className={`ch-previa-estado ${estadoHabitacion === "DISPONIBLE" ? "ok" : "mant"}`}>
                  {estadoHabitacion === "DISPONIBLE" ? "Disponible" : "Mantenimiento"}
                </span>
              </div>
              <strong className="ch-previa-titulo">Habitación {numeroHabitacion || "—"}</strong>
              <span className="gb-ayuda">{tipo ? `${tipo.nombreTipoHabitacion} · hasta ${tipo.capacidadMaxima} personas` : "Sin tipo"}</span>
              <span className="ch-previa-precio">{precioNoche ? `${pesos(Number(precioNoche))} / noche` : "Precio por definir"}</span>
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
