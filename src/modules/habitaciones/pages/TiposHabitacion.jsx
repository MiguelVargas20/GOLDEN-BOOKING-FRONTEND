import { useState, useEffect } from "react";
import { Row, Col, Form, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { BsPencil, BsTrash, BsArrowLeft } from "react-icons/bs";
import Swal from 'sweetalert2';
import {
  listarTiposHabitacion,
  crearTipoHabitacion,
  actualizarTipoHabitacion,
  eliminarTipoHabitacion,
} from "../api/HabitacionApi";
import { escapeHtml } from "../../../shared/utils/escapeHtml";
import "../../../shared/styles/PanelAdmin.css";
import "../../../shared/styles/BotonesCompartidos.css";

/**
 * Tipos de habitación (ADMIN): crear, editar y eliminar las categorías
 * (Suite, Doble...) con su capacidad máxima. Estilo común (gb-panel).
 */

const FORM_VACIO = {
  nombreTipoHabitacion: "",
  descripcion: "",
  capacidadMaxima: "",
};

export default function TiposHabitacion() {
  const navigate = useNavigate();
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

    // DTO que espera el back
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
        // POST
        await crearTipoHabitacion(dto);
        setExito("¡Tipo de habitación creado con éxito!");
      }
      // Solo se limpia el formulario: resetForm() también borraría el aviso de éxito
      setForm(FORM_VACIO);
      setEditandoId(null);
      cargarTipos();
    } catch (err) {
      setError(err.message || "Error al guardar el tipo de habitación.");
    } finally {
      setLoadingForm(false);
    }
  };

  /* ── Eliminar ─────────────────────────────────────────── */
  const handleEliminar = async (id, nombre) => {
      const resultado = await Swal.fire({
          title: '¿Eliminar tipo de habitación?',
          html: `
              <p><strong>${escapeHtml(nombre)}</strong> será eliminado permanentemente.</p>
              <p style="color:#e53e3e;margin-top:8px;font-size:0.9rem">
                  Las habitaciones asociadas a este tipo podrían verse afectadas.
              </p>
          `,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#e53e3e',
          cancelButtonColor: '#6c757d',
      });

      if (!resultado.isConfirmed) return;

      setEliminandoId(id);
      setError("");
      setExito("");
      try {
          await eliminarTipoHabitacion(id);
          await Swal.fire({
              title: '¡Eliminado!',
              text: `"${nombre}" fue eliminado correctamente.`,
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
          });
          if (editandoId === id) resetForm();
          cargarTipos();
      } catch (err) {
          Swal.fire({
              title: 'Error',
              text: err.message || 'No se pudo eliminar el tipo.',
              icon: 'error',
              confirmButtonColor: '#f38d1e',
          });
      } finally {
          setEliminandoId(null);
      }
  };
  /* ── Render ───────────────────────────────────────────── */
  return (
    <div className="gb-panel">
      <div className="gb-panel-header">
        <div>
          <h1 className="gb-panel-titulo">Tipos de <span>habitación</span></h1>
          <p className="gb-panel-subtitulo">Categorías del hotel y cuántas personas caben en cada una.</p>
        </div>
        <div className="gb-panel-acciones">
          <button type="button" className="btn-gb btn-gb-neutral btn-gb-sm" onClick={() => navigate("/habitaciones/gestionar")}>
            <BsArrowLeft /> Habitaciones
          </button>
        </div>
      </div>

      <Row className="g-4 align-items-start">
        <Col lg={4}>
          <div className="gb-tarjeta">
            <h2 className="gb-seccion-titulo">{editandoId ? "Editar tipo" : "Nuevo tipo"}</h2>
            {error && <Alert variant="danger" className="py-2">{error}</Alert>}
            {exito && <Alert variant="success" className="py-2">{exito}</Alert>}

            <Form onSubmit={handleGuardar} noValidate className="gb-form">
              <Form.Group className="mb-3">
                <Form.Label htmlFor="th-nombre">Nombre *</Form.Label>
                <Form.Control id="th-nombre" name="nombreTipoHabitacion" maxLength={50} placeholder="Ej.: Suite"
                  value={form.nombreTipoHabitacion} onChange={handleChange} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="th-capacidad">Capacidad máxima (personas) *</Form.Label>
                <Form.Control id="th-capacidad" name="capacidadMaxima" type="number" min={1} max={20} step={1}
                  inputMode="numeric" placeholder="2" value={form.capacidadMaxima} onChange={handleChange} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="th-desc">Descripción</Form.Label>
                <Form.Control id="th-desc" name="descripcion" as="textarea" rows={3} maxLength={300}
                  placeholder="Qué incluye este tipo de habitación" value={form.descripcion} onChange={handleChange} />
              </Form.Group>
              <div className="gb-form-botones">
                {editandoId && (
                  <button type="button" className="btn-gb btn-gb-secondary" onClick={resetForm} disabled={loadingForm}>
                    Cancelar edición
                  </button>
                )}
                <button type="submit" className="btn-gb btn-gb-primary" disabled={loadingForm}>
                  {loadingForm ? <><Spinner size="sm" /> Guardando…</> : editandoId ? "Guardar cambios" : "Crear tipo"}
                </button>
              </div>
            </Form>
          </div>
        </Col>

        <Col lg={8}>
          <div className="gb-tabla-contenedor">
            <table className="gb-tabla" style={{ minWidth: 560 }}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Capacidad</th>
                  <th>Descripción</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loadingLista ? (
                  <tr><td colSpan={4} className="gb-tabla-vacia"><Spinner size="sm" /> Cargando…</td></tr>
                ) : tipos.length === 0 ? (
                  <tr><td colSpan={4} className="gb-tabla-vacia">Aún no hay tipos de habitación. Crea el primero.</td></tr>
                ) : tipos.map((t) => (
                  <tr key={t.id} className={editandoId === t.id ? "th-editando" : ""}>
                    <td className="gb-celda-principal">{t.nombreTipoHabitacion}</td>
                    <td>{t.capacidadMaxima} {t.capacidadMaxima === 1 ? "persona" : "personas"}</td>
                    <td><span className="gb-celda-secundaria">{t.descripcion || "—"}</span></td>
                    <td>
                      <div className="gb-acciones-fila">
                        <button type="button" className="btn-gb btn-gb-neutral btn-gb-sm" onClick={() => handleEditar(t)}>
                          <BsPencil /> Editar
                        </button>
                        <button type="button" className="btn-gb btn-gb-danger btn-gb-sm"
                          onClick={() => handleEliminar(t.id, t.nombreTipoHabitacion)}
                          disabled={eliminandoId === t.id} aria-label={`Eliminar ${t.nombreTipoHabitacion}`}>
                          {eliminandoId === t.id ? <Spinner size="sm" /> : <BsTrash />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Col>
      </Row>
    </div>
  );
}
