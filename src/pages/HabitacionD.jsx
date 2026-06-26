import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Form, Button, Alert, Spinner } from "react-bootstrap";
import { crearHabitacion, listarTiposHabitacion } from "../api/habitacionApi";
import "../styles/HabitacionD.css";

const ESTADOS = [
  { value: "disponible", label: "✓ Disponible", color: "#2e7d32" },
  { value: "ocupada", label: "✗ Ocupada", color: "#c62828" },
  { value: "mantenimiento", label: "⚙ Mantenimiento", color: "#e65100" },
];

export default function HabitacionD() {
  const navigate = useNavigate();

  // ── Tipos de habitación desde el back ────────────────────
  const [tipos, setTipos] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(true);

  // ── Campos del formulario ─────────────────────────────────
  const [numeroHabitacion, setNumeroHabitacion] = useState("");
  const [idTipo, setIdTipo] = useState("");
  const [precioNoche, setPrecioNoche] = useState("");
  const [estadoHabitacion, setEstadoHabitacion] = useState("disponible");
  const [descripcion, setDescripcion] = useState("");

  // ── Feedback ──────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  /* ── Cargar tipos de habitación al montar ─────────────── */
  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await listarTiposHabitacion();
        setTipos(data);
        if (data.length > 0) setIdTipo(data[0].id);
      } catch {
        setError("No se pudieron cargar los tipos de habitación.");
      } finally {
        setLoadingTipos(false);
      }
    };
    cargar();
  }, []);

  const tipoSeleccionado = tipos.find((t) => t.id === idTipo);

  /* ── Submit ───────────────────────────────────────────── */
  const handleGuardar = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");

    if (!numeroHabitacion.trim())
      return setError("El número de habitación es requerido.");
    if (!idTipo) return setError("Selecciona un tipo de habitación.");
    if (!precioNoche || parseFloat(precioNoche) <= 0)
      return setError("Ingresa un precio por noche válido.");

    setLoading(true);
    try {
      const body = {
        numeroHabitacion: numeroHabitacion.trim(),
        datosTipoHabitacion: tipoSeleccionado,
        precioNoche: parseFloat(precioNoche),
        estadoHabitacion: estadoHabitacion,
        descripcion: descripcion.trim() || null,
      };

      await crearHabitacion(body);
      setExito("¡Habitación registrada con éxito!");
      setTimeout(() => navigate("/reservas-hospedaje"), 1500);
    } catch (err) {
      setError(err.message || "Error al registrar la habitación.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="habitacion-container">
      {/* Se expandió el max-width a 1200px para llenar pantallas grandes */}
      <div className="container" style={{ maxWidth: "1200px" }}> 
        <Row className="g-5 align-items-start">
          
          {/* ── Columna izquierda: info decorativa ──────── */}
          <Col lg={4} md={5}>
            <h2
              style={{
                fontFamily: '"Bungee", sans-serif',
                fontWeight: 400,
                color: "#1a1a2e",
                fontSize: "2.2rem",
                lineHeight: 1.2,
                marginBottom: "0.5rem",
              }}
            >
              Registro de{" "}
              <span style={{ color: "#f38d1e" }}>Habitación</span>
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.85rem", letterSpacing: "1px", fontWeight: "600" }}>
              GESTIÓN EJECUTIVA DE PROPIEDADES
            </p>

            {/* Preview Integrada */}
            <div className="habitacion-preview-card text-center d-flex flex-column align-items-center justify-content-center">
              <div className="preview-icon-badge">🏨</div>
              <span style={{ fontWeight: 700, fontSize: "1.2rem", color: "#1a1a2e" }}>
                {numeroHabitacion ? `Hab. ${numeroHabitacion}` : "Vista previa"}
              </span>
              
              {tipoSeleccionado && (
                <span style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "2px" }}>
                  {tipoSeleccionado.nombreTipoHabitacion}
                </span>
              )}
              
              {precioNoche && (
                <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f38d1e", marginTop: "6px" }}>
                  ${parseFloat(precioNoche).toLocaleString("es-CO")} / noche
                </span>
              )}
              
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  padding: "5px 16px",
                  borderRadius: "20px",
                  marginTop: "10px",
                  background:
                    estadoHabitacion === "disponible"
                      ? "#e6f4ea"
                      : estadoHabitacion === "ocupada"
                        ? "#fce8e6"
                        : "#fff3e0",
                  color:
                    estadoHabitacion === "disponible"
                      ? "#2e7d32"
                      : estadoHabitacion === "ocupada"
                        ? "#c62828"
                        : "#e65100",
                }}
              >
                {ESTADOS.find((e) => e.value === estadoHabitacion)?.label}
              </span>
            </div>

            {/* Elemento visual de soporte técnico / estándares */}
            <div className="amenidades-sidebar">
              <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                Estándares del Sistema
              </p>
              <div className="amenidad-item">
                <i className="bi bi-shield-check"></i>
                <span>Validación automática de duplicados</span>
              </div>
              <div className="amenidad-item">
                <i className="bi bi-lightning-charge"></i>
                <span>Sincronización en tiempo real con el PMS</span>
              </div>
              <div className="amenidad-item">
                <i className="bi bi-currency-dollar"></i>
                <span>Moneda base configurada en COP</span>
              </div>
            </div>
          </Col>

          {/* ── Columna derecha: formulario ──────────────── */}
          <Col lg={8} md={7}>
            <div
              style={{
                background: "#fff",
                borderRadius: "20px",
                padding: "3rem",
                border: "1px solid #e2e8f0",
                boxShadow: "0 10px 25px rgba(0,0,0,.03)",
              }}
            >
              <p className="habitacion-datos-label">
                Datos de la Habitación
              </p>
              <hr style={{ borderColor: "#e2e8f0", marginBottom: "1.75rem" }} />

              {error && (
                <Alert variant="danger" className="small py-2">
                  {error}
                </Alert>
              )}
              {exito && (
                <Alert variant="success" className="small py-2">
                  {exito}
                </Alert>
              )}

              <Form onSubmit={handleGuardar} noValidate>
                {/* Número + Tipo */}
                <Row className="mb-4 g-3">
                  <Col md={4}>
                    <CampoLabel label="Número de Habitación" />
                    <Form.Control
                      placeholder="Ej: 402-A"
                      value={numeroHabitacion}
                      onChange={(e) => setNumeroHabitacion(e.target.value)}
                      className="campo-d"
                    />
                  </Col>
                  <Col md={8}>
                    <CampoLabel label="Tipo de Habitación" />
                    {loadingTipos ? (
                      <div className="d-flex align-items-center gap-2 mt-1">
                        <Spinner size="sm" />
                        <span className="text-muted small">
                          Cargando tipos...
                        </span>
                      </div>
                    ) : (
                      <div className="d-flex gap-2">
                        <Form.Select
                          value={idTipo}
                          onChange={(e) => setIdTipo(e.target.value)}
                          className="campo-d flex-grow-1"
                        >
                          <option value="">Selecciona un tipo...</option>
                          {tipos.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.nombreTipoHabitacion} — Cap. {t.capacidadMaxima} personas
                            </option>
                          ))}
                        </Form.Select>
                        <Button 
                          type="button" 
                          className="btn-add-tipo-room"
                          onClick={() => navigate("/tipo-habitacion")}
                          title="Crear nuevo tipo de habitación"
                        >
                          +
                        </Button>
                      </div>
                    )}
                  </Col>
                </Row>

                {/* Info del tipo seleccionado */}
                {tipoSeleccionado && (
                  <div className="habitacion-tipo-info mb-4">
                    <strong>{tipoSeleccionado.nombreTipoHabitacion}</strong>
                    {tipoSeleccionado.descripcion && ` — ${tipoSeleccionado.descripcion}`}
                    {tipoSeleccionado.capacidadMaxima && (
                      <span> · 👥 Máx. {tipoSeleccionado.capacidadMaxima} personas</span>
                    )}
                  </div>
                )}

                {/* Precio + Estado */}
                <Row className="mb-4 g-3">
                  <Col md={6}>
                    <CampoLabel label="Precio por Noche" />
                    <div style={{ position: "relative" }}>
                      <span
                        style={{
                          position: "absolute",
                          left: "0.85rem",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#94a3b8",
                          fontWeight: 700,
                        }}
                      >
                        $
                      </span>
                      <Form.Control
                        type="number"
                        placeholder="0.00"
                        min="0"
                        value={precioNoche}
                        onChange={(e) => setPrecioNoche(e.target.value)}
                        className="campo-d"
                        style={{ paddingLeft: "1.75rem" }}
                      />
                    </div>
                  </Col>
                  <Col md={6}>
                    <CampoLabel label="Estado de la Habitación" />
                    <Form.Select
                      value={estadoHabitacion}
                      onChange={(e) => setEstadoHabitacion(e.target.value)}
                      className="campo-d"
                    >
                      {ESTADOS.map((e) => (
                        <option key={e.value} value={e.value}>
                          {e.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                </Row>

                {/* Descripción */}
                <Form.Group className="mb-4">
                  <CampoLabel label="Descripción" />
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Detalles de la suite, comodidades y vista..."
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    className="campo-d"
                    style={{ resize: "none" }}
                  />
                </Form.Group>

                <hr style={{ borderColor: "#e2e8f0", marginBottom: "1.5rem" }} />

                {/* Botones */}
                <div className="d-flex justify-content-end gap-2">
                  <Button
                    variant="outline-secondary"
                    className="habitacion-cancel-btn"
                    onClick={() => navigate("/reservas-hospedaje")}
                    disabled={loading}
                    style={{ borderRadius: "10px", fontWeight: 600 }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="habitacion-submit-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Finalizando Registro...
                      </>
                    ) : (
                      "Finalizar Registro"
                    )}
                  </Button>
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}

function CampoLabel({ label }) {
  return (
    <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>
      {label}
    </p>
  );
}