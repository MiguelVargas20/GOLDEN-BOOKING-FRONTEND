import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Form, Button, Alert, Spinner } from "react-bootstrap";
import { crearHabitacion, listarTiposHabitacion } from "../api/habitacionApi";

/**
 * HABITACIÓN D — vista de administración / registro
 *
 * Envía a: POST /api/habitaciones
 * HabitacionDto: {
 * numeroHabitacion,
 * datosTipoHabitacion: { id, nombreTipoHabitacion, descripcion, capacidadMaxima },
 * precioNoche,
 * estadoHabitacion,
 * descripcion
 * }
 */

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

  // Tipo seleccionado actualmente (para mostrar info)
  const tipoSeleccionado = tipos.find((t) => t.id === idTipo);

  /* ── Submit ───────────────────────────────────────────── */
  const handleGuardar = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");

    // Validaciones
    if (!numeroHabitacion.trim())
      return setError("El número de habitación es requerido.");
    if (!idTipo) return setError("Selecciona un tipo de habitación.");
    if (!precioNoche || parseFloat(precioNoche) <= 0)
      return setError("Ingresa un precio por noche válido.");

    setLoading(true); // ← CORREGIDO: Antes decía loading(true) y daría error
    try {
      // Armamos el DTO exacto que espera el back
      const body = {
        numeroHabitacion: numeroHabitacion.trim(),
        datosTipoHabitacion: tipoSeleccionado, // objeto completo del tipo
        precioNoche: parseFloat(precioNoche),
        estadoHabitacion: estadoHabitacion,
        descripcion: descripcion.trim() || null,
      };

      await crearHabitacion(body);
      setExito("¡Habitacion registrada con éxito!");
      setTimeout(() => navigate("/reservas-hospedaje"), 1500);
    } catch (err) {
      setError(err.message || "Error al registrar la habitación.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        padding: "2rem 0",
      }}
    >
      <div className="container" style={{ maxWidth: "860px" }}>
        <Row className="g-5 align-items-start">
          {/* ── Columna izquierda: info decorativa ──────── */}
          <Col md={4}>
            <h2
              style={{
                fontFamily: "Georgia, serif",
                fontWeight: 700,
                color: "#1a1a2e",
                fontSize: "2rem",
                lineHeight: 1.2,
                marginBottom: "1rem",
              }}
            >
              Registro de Habitación
            </h2>
            <p
              style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: 1.7 }}
            >
              GESTIÓN EJECUTIVA DE PROPIEDADES
            </p>

            {/* Preview */}
            <div
              style={{
                background: "linear-gradient(135deg, #f5e6c8 0%, #e8d5a3 100%)",
                borderRadius: "16px",
                height: "220px",
                marginTop: "1.5rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                color: "#c9a84c",
                border: "1px solid #e8d5a3",
              }}
            >
              <span style={{ fontSize: "3rem" }}>🏨</span>
              <span
                style={{ fontWeight: 700, fontSize: "1rem", color: "#1a1a2e" }}
              >
                {numeroHabitacion ? `Hab. ${numeroHabitacion}` : "Vista previa"}
              </span>
              {tipoSeleccionado && (
                <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                  {tipoSeleccionado.nombreTipoHabitacion}
                </span>
              )}
              {precioNoche && (
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "#c9a84c",
                  }}
                >
                  ${parseFloat(precioNoche).toLocaleString("es-CO")} / noche
                </span>
              )}
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  padding: "3px 12px",
                  borderRadius: "20px",
                  marginTop: "4px",
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
          </Col>

          {/* ── Columna derecha: formulario ─────────────── */}
          <Col md={8}>
            <div
              style={{
                background: "#fff",
                borderRadius: "20px",
                padding: "2.5rem",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 16px rgba(0,0,0,.06)",
              }}
            >
              {/* Encabezado */}
              <p
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                  color: "#c9a84c",
                  textTransform: "uppercase",
                  marginBottom: "0.5rem",
                }}
              >
                DATOS DE LA HABITACIÓN
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
                      <Form.Select
                        value={idTipo}
                        onChange={(e) => setIdTipo(e.target.value)}
                        className="campo-d"
                      >
                        <option value="">Selecciona un tipo...</option>
                        {tipos.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.nombreTipoHabitacion} — Cap. {t.capacidadMaxima}{" "}
                            personas
                          </option>
                        ))}
                      </Form.Select>
                    )}
                  </Col>
                </Row>

                {/* Info del tipo seleccionado */}
                {tipoSeleccionado && (
                  <div
                    style={{
                      background: "#fdf8ee",
                      borderRadius: "10px",
                      padding: "0.85rem 1rem",
                      marginBottom: "1.5rem",
                      border: "1px solid #f0e0b0",
                      fontSize: "0.82rem",
                      color: "#64748b",
                    }}
                  >
                    <strong style={{ color: "#c9a84c" }}>
                      {tipoSeleccionado.nombreTipoHabitacion}
                    </strong>
                    {tipoSeleccionado.descripcion &&
                      ` — ${tipoSeleccionado.descripcion}`}
                    {tipoSeleccionado.capacidadMaxima && (
                      <span>
                        {" "}
                        · 👥 Máx. {tipoSeleccionado.capacidadMaxima} personas
                      </span>
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
                    rows={3}
                    placeholder="Detalles de la suite, comodidades y vista..."
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    className="campo-d"
                    style={{ resize: "none" }}
                  />
                </Form.Group>

                <hr
                  style={{ borderColor: "#e2e8f0", marginBottom: "1.5rem" }}
                />

                {/* Botones */}
                <div className="d-flex justify-content-end gap-2">
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate("/reservas-hospedaje")}
                    disabled={loading}
                    style={{ borderRadius: "10px", fontWeight: 600 }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    style={{
                      background: "#c9a84c",
                      border: "none",
                      borderRadius: "10px",
                      fontWeight: 700,
                      padding: "0.5rem 2rem",
                    }}
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

      <style>{`
        .campo-d {
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 0.65rem 1rem;
          font-size: 0.875rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .campo-d:focus {
          border-color: #c9a84c;
          box-shadow: 0 0 0 3px rgba(201,168,76,.15);
          background: #fff;
        }
      `}</style>
    </div>
  );
}

function CampoLabel({ label }) {
  return (
    <p
      style={{
        fontSize: "0.78rem",
        fontWeight: 600,
        color: "#475569",
        marginBottom: "6px",
      }}
    >
      {label}
    </p>
  );
}