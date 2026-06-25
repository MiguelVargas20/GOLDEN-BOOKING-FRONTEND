import { useState, useEffect } from "react";
import { Row, Col, Form, Button, Alert, Spinner, Table, Badge } from "react-bootstrap";
import {
  listarTiposHabitacion,
  crearTipoHabitacion,
  actualizarTipoHabitacion,
  eliminarTipoHabitacion,
} from "../api/habitacionApi";

/**
 * TIPO HABITACIÓN D — vista de administración
 *
 * Endpoints usados:
 *   GET    /api/tipohabitaciones
 *   POST   /api/tipohabitaciones
 *   PUT    /api/tipohabitaciones/:id
 *   DELETE /api/tipohabitaciones/:id
 *
 * TipoHabitacionDto: { id?, nombreTipoHabitacion, descripcion, capacidadMaxima }
 */

const FORM_VACIO = {
  nombreTipoHabitacion: "",
  descripcion: "",
  capacidadMaxima: "",
};

export default function TipoHabitacionD() {
  // ── Lista de tipos ────────────────────────────────────────
  const [tipos, setTipos] = useState([]);
  const [loadingLista, setLoadingLista] = useState(true);

  // ── Formulario ────────────────────────────────────────────
  const [form, setForm] = useState(FORM_VACIO);
  const [editandoId, setEditandoId] = useState(null); // null = modo crear
  const [loadingForm, setLoadingForm] = useState(false);

  // ── Feedback ──────────────────────────────────────────────
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  // ── Eliminar ──────────────────────────────────────────────
  const [eliminandoId, setEliminandoId] = useState(null);

  /* ── Cargar lista al montar ──────────────────────────── */
  useEffect(() => {
    cargarTipos();
  }, []);

  const cargarTipos = async () => {
    setLoadingLista(true);
    try {
      const data = await listarTiposHabitacion();
      setTipos(data);
    } catch {
      setError("No se pudieron cargar los tipos de habitación.");
    } finally {
      setLoadingLista(false);
    }
  };

  /* ── Cambios en el formulario ────────────────────────── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ── Limpiar / cancelar edición ──────────────────────── */
  const resetForm = () => {
    setForm(FORM_VACIO);
    setEditandoId(null);
    setError("");
    setExito("");
  };

  /* ── Cargar datos en el form para editar ─────────────── */
  const handleEditar = (tipo) => {
    setForm({
      nombreTipoHabitacion: tipo.nombreTipoHabitacion,
      descripcion: tipo.descripcion || "",
      capacidadMaxima: tipo.capacidadMaxima ?? "",
    });
    setEditandoId(tipo.id);
    setError("");
    setExito("");
    // Scroll suave al formulario
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── Submit: crear o actualizar ──────────────────────── */
  const handleGuardar = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");

    // Validaciones
    if (!form.nombreTipoHabitacion.trim())
      return setError("El nombre del tipo es requerido.");
    if (!form.capacidadMaxima || parseInt(form.capacidadMaxima) <= 0)
      return setError("La capacidad máxima debe ser mayor a 0.");

    // DTO que espera el back (nombres del DTO, no del modelo)
    const dto = {
      nombreTipoHabitacion: form.nombreTipoHabitacion.trim(),
      descripcion: form.descripcion.trim() || null,
      capacidadMaxima: parseInt(form.capacidadMaxima),
    };

    setLoadingForm(true);
    try {
      if (editandoId) {
        // PUT
        await actualizarTipoHabitacion(editandoId, dto);
        setExito("¡Tipo de habitación actualizado con éxito!");
      } else {
        // POST — el id lo genera MongoDB, no lo enviamos
        await crearTipoHabitacion(dto);
        setExito("¡Tipo de habitación creado con éxito!");
      }
      resetForm();
      cargarTipos();
    } catch (err) {
      setError(err.message || "Error al guardar el tipo de habitación.");
    } finally {
      setLoadingForm(false);
    }
  };

  /* ── Eliminar ─────────────────────────────────────────── */
  const handleEliminar = async (id) => {
    setEliminandoId(id);
    setError("");
    setExito("");
    try {
      await eliminarTipoHabitacion(id);
      setExito("Tipo de habitación eliminado.");
      // Si estábamos editando ese mismo, limpiamos el form
      if (editandoId === id) resetForm();
      cargarTipos();
    } catch (err) {
      setError(err.message || "Error al eliminar el tipo.");
    } finally {
      setEliminandoId(null);
    }
  };

  /* ── Render ───────────────────────────────────────────── */
  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh", padding: "2rem 0" }}>
      <div className="container" style={{ maxWidth: "960px" }}>

        {/* ── Título de página ──────────────────────────── */}
        <div className="mb-4">
          <h2
            style={{
              fontFamily: '"Bungee", sans-serif',
              fontWeight: 400,
              color: "#1a1a2e",
              fontSize: "2rem",
              marginBottom: "0.25rem",
            }}
          >
            Tipos de <span style={{ color: "#f38d1e" }}>Habitación</span>
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0 }}>
            GESTIÓN DE CATEGORÍAS — GOLDEN BOOKING
          </p>
        </div>

        {/* ── Alertas globales ──────────────────────────── */}
        {error && (
          <Alert variant="danger" className="small py-2" onClose={() => setError("")} dismissible>
            {error}
          </Alert>
        )}
        {exito && (
          <Alert variant="success" className="small py-2" onClose={() => setExito("")} dismissible>
            {exito}
          </Alert>
        )}

        <Row className="g-4 align-items-start">

          {/* ══════════════════════════════════════════════
              Columna izquierda — Formulario
          ══════════════════════════════════════════════ */}
          <Col md={5}>
            <div
              style={{
                background: "#fff",
                borderRadius: "20px",
                padding: "2rem",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 16px rgba(0,0,0,.06)",
              }}
            >
              {/* Header del form */}
              <p
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                  color: "#f38d1e",
                  textTransform: "uppercase",
                  marginBottom: "0.4rem",
                }}
              >
                {editandoId ? "✏️ Editar Tipo" : "➕ Nuevo Tipo"}
              </p>
              <hr style={{ borderColor: "#e2e8f0", marginBottom: "1.5rem" }} />

              {/* Preview en tiempo real */}
              <div
                style={{
                  background: "#fdfaf7",
                  border: "1px solid #f0e4cc",
                  borderRadius: "14px",
                  padding: "1.25rem",
                  marginBottom: "1.5rem",
                  textAlign: "center",
                }}
              >
                <span style={{ fontSize: "2.5rem" }}>🛏️</span>
                <p
                  style={{
                    fontFamily: '"Bungee", sans-serif',
                    color: "#1a1a2e",
                    fontSize: "1rem",
                    margin: "0.5rem 0 0.25rem",
                  }}
                >
                  {form.nombreTipoHabitacion || "Nombre del tipo"}
                </p>
                {form.descripcion && (
                  <p style={{ fontSize: "0.78rem", color: "#64748b", margin: "0 0 0.25rem" }}>
                    {form.descripcion}
                  </p>
                )}
                {form.capacidadMaxima && (
                  <span
                    style={{
                      display: "inline-block",
                      background: "#fff3e0",
                      color: "#f38d1e",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      padding: "3px 12px",
                      borderRadius: "20px",
                      marginTop: "4px",
                    }}
                  >
                    👥 Máx. {form.capacidadMaxima} personas
                  </span>
                )}
              </div>

              {/* Formulario */}
              <Form onSubmit={handleGuardar} noValidate>
                <Form.Group className="mb-3">
                  <CampoLabel label="Nombre del Tipo *" />
                  <Form.Control
                    name="nombreTipoHabitacion"
                    placeholder="Ej: Suite Presidencial"
                    value={form.nombreTipoHabitacion}
                    onChange={handleChange}
                    className="campo-d"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <CampoLabel label="Descripción" />
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="descripcion"
                    placeholder="Características generales del tipo..."
                    value={form.descripcion}
                    onChange={handleChange}
                    className="campo-d"
                    style={{ resize: "none" }}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <CampoLabel label="Capacidad Máxima (personas) *" />
                  <Form.Control
                    type="number"
                    min="1"
                    name="capacidadMaxima"
                    placeholder="Ej: 2"
                    value={form.capacidadMaxima}
                    onChange={handleChange}
                    className="campo-d"
                  />
                </Form.Group>

                <div className="d-flex gap-2">
                  {editandoId && (
                    <Button
                      variant="outline-secondary"
                      className="habitacion-cancel-btn"
                      onClick={resetForm}
                      disabled={loadingForm}
                      style={{ flex: 1 }}
                    >
                      Cancelar
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className="habitacion-submit-btn"
                    disabled={loadingForm}
                    style={{
                      flex: 1,
                      background: "#f38d1e",
                      border: "none",
                      borderRadius: "10px",
                      fontWeight: 700,
                      padding: "0.55rem 1rem",
                      color: "#fff",
                    }}
                  >
                    {loadingForm ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        {editandoId ? "Actualizando..." : "Guardando..."}
                      </>
                    ) : editandoId ? (
                      "Guardar Cambios"
                    ) : (
                      "Crear Tipo"
                    )}
                  </Button>
                </div>
              </Form>
            </div>
          </Col>

          {/* ══════════════════════════════════════════════
              Columna derecha — Tabla de tipos existentes
          ══════════════════════════════════════════════ */}
          <Col md={7}>
            <div
              style={{
                background: "#fff",
                borderRadius: "20px",
                padding: "2rem",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 16px rgba(0,0,0,.06)",
              }}
            >
              <p
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                  color: "#f38d1e",
                  textTransform: "uppercase",
                  marginBottom: "0.4rem",
                }}
              >
                📋 Tipos Registrados
              </p>
              <hr style={{ borderColor: "#e2e8f0", marginBottom: "1.25rem" }} />

              {loadingLista ? (
                <div className="d-flex align-items-center gap-2 py-4 justify-content-center">
                  <Spinner size="sm" style={{ color: "#f38d1e" }} />
                  <span className="text-muted small">Cargando tipos...</span>
                </div>
              ) : tipos.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "2.5rem 0",
                    color: "#94a3b8",
                  }}
                >
                  <span style={{ fontSize: "2.5rem" }}>🛏️</span>
                  <p className="mt-2 small">No hay tipos de habitación registrados aún.</p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <Table hover responsive style={{ fontSize: "0.85rem" }}>
                    <thead>
                      <tr
                        style={{
                          background: "#1a1a2e",
                          color: "#fff",
                          fontSize: "0.72rem",
                          letterSpacing: "0.8px",
                          textTransform: "uppercase",
                        }}
                      >
                        <th style={{ padding: "0.85rem 1rem", fontWeight: 700, borderRadius: "0", border: "none" }}>
                          Nombre
                        </th>
                        <th style={{ padding: "0.85rem 1rem", fontWeight: 700, border: "none" }}>
                          Descripción
                        </th>
                        <th style={{ padding: "0.85rem 1rem", fontWeight: 700, border: "none", textAlign: "center" }}>
                          Cap.
                        </th>
                        <th style={{ padding: "0.85rem 1rem", fontWeight: 700, border: "none", textAlign: "center" }}>
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tipos.map((tipo) => (
                        <tr
                          key={tipo.id}
                          style={{
                            background: editandoId === tipo.id ? "#fff8f0" : "transparent",
                            transition: "background 0.2s",
                          }}
                        >
                          <td style={{ padding: "0.85rem 1rem", verticalAlign: "middle", fontWeight: 600, color: "#1a1a2e" }}>
                            {editandoId === tipo.id && (
                              <span
                                style={{
                                  display: "inline-block",
                                  width: "6px",
                                  height: "6px",
                                  borderRadius: "50%",
                                  background: "#f38d1e",
                                  marginRight: "6px",
                                  verticalAlign: "middle",
                                }}
                              />
                            )}
                            {tipo.nombreTipoHabitacion}
                          </td>
                          <td style={{ padding: "0.85rem 1rem", verticalAlign: "middle", color: "#64748b" }}>
                            {tipo.descripcion || (
                              <span style={{ color: "#cbd5e1", fontStyle: "italic" }}>Sin descripción</span>
                            )}
                          </td>
                          <td style={{ padding: "0.85rem 1rem", verticalAlign: "middle", textAlign: "center" }}>
                            <Badge
                              style={{
                                background: "#fff3e0",
                                color: "#f38d1e",
                                fontWeight: 700,
                                fontSize: "0.78rem",
                                padding: "4px 10px",
                                borderRadius: "20px",
                              }}
                            >
                              👥 {tipo.capacidadMaxima}
                            </Badge>
                          </td>
                          <td style={{ padding: "0.85rem 1rem", verticalAlign: "middle", textAlign: "center" }}>
                            <div className="d-flex gap-2 justify-content-center">
                              {/* Botón editar */}
                              <button
                                className="btn-tabla-editar"
                                onClick={() => handleEditar(tipo)}
                                title="Editar"
                              >
                                ✏️
                              </button>
                              {/* Botón eliminar */}
                              <button
                                className="btn-tabla-eliminar"
                                onClick={() => handleEliminar(tipo.id)}
                                disabled={eliminandoId === tipo.id}
                                title="Eliminar"
                              >
                                {eliminandoId === tipo.id ? (
                                  <span className="spinner-border spinner-border-sm" />
                                ) : (
                                  "🗑️"
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}

              {/* Contador */}
              {tipos.length > 0 && (
                <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: "0.5rem 0 0", textAlign: "right" }}>
                  {tipos.length} tipo{tipos.length !== 1 ? "s" : ""} registrado{tipos.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </Col>
        </Row>
      </div>

      {/* ── Estilos internos ───────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bungee&display=swap');

        /* Inputs */
        .campo-d {
          background: #f8fafc !important;
          border: 1.5px solid #e2e8f0 !important;
          border-radius: 10px !important;
          padding: 0.65rem 1rem !important;
          font-size: 0.875rem !important;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .campo-d:focus {
          border-color: #f38d1e !important;
          box-shadow: 0 0 0 3px rgba(243, 141, 30, 0.15) !important;
          background: #fff !important;
          outline: none;
        }

        /* Botón cancelar */
        .habitacion-cancel-btn {
          border-radius: 10px !important;
          font-weight: 600 !important;
          color: #475569 !important;
          border-color: #cbd5e1 !important;
        }
        .habitacion-cancel-btn:hover {
          background-color: #f1f5f9 !important;
        }

        /* Botón submit hover */
        .habitacion-submit-btn:hover:not(:disabled) {
          background: #d97a12 !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(243, 141, 30, 0.35);
        }
        .habitacion-submit-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: none;
        }
        .habitacion-submit-btn:disabled {
          opacity: 0.7;
        }

        /* Botones de la tabla */
        .btn-tabla-editar,
        .btn-tabla-eliminar {
          background: none;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          padding: 4px 10px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.15s ease;
          line-height: 1.4;
        }
        .btn-tabla-editar:hover {
          background: #fff8f0;
          border-color: #f38d1e;
          transform: translateY(-1px);
        }
        .btn-tabla-eliminar:hover:not(:disabled) {
          background: #fff0f0;
          border-color: #e53e3e;
          transform: translateY(-1px);
        }
        .btn-tabla-eliminar:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Encabezado de tabla oscuro */
        thead tr th:first-child {
          border-radius: 10px 0 0 10px;
        }
        thead tr th:last-child {
          border-radius: 0 10px 10px 0;
        }
      `}</style>
    </div>
  );
}

/* ── Sub-componente: label de campo ──────────────────────── */
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