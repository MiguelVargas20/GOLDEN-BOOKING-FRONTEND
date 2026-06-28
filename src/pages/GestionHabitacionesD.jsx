import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Badge, Spinner, Container, Modal, Form, Row, Col, Button } from "react-bootstrap";
import { listarHabitaciones, actualizarHabitacion, eliminarHabitacion, listarTiposHabitacion } from "../api/habitacionApi";
import Swal from "sweetalert2";

const ESTADOS = ["disponible", "ocupada", "mantenimiento"];

export default function GestionHabitacionesD() {
    const navigate = useNavigate();
    const [habitaciones, setHabitaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [eliminandoId, setEliminandoId] = useState(null);

    // ── Modal editar ─────────────────────────────────────────
    const [showModal, setShowModal] = useState(false);
    const [habEditando, setHabEditando] = useState(null);
    const [tipos, setTipos] = useState([]);
    const [loadingGuardar, setLoadingGuardar] = useState(false);
    const [form, setForm] = useState({
        numeroHabitacion: "",
        precioNoche: "",
        estadoHabitacion: "disponible",
        descripcion: "",
        idTipo: "",
    });

    useEffect(() => { cargarDatos(); }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [habs, tiposData] = await Promise.all([
                listarHabitaciones(),
                listarTiposHabitacion(),
            ]);
            setHabitaciones(habs);
            setTipos(tiposData);
        } catch {
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar las habitaciones.',
                icon: 'error',
                confirmButtonColor: '#f38d1e',
            });
        } finally {
            setLoading(false);
        }
    };

    // ── Abrir modal con datos de la hab ──────────────────────
    const handleEditar = (hab) => {
        setHabEditando(hab);
        setForm({
            numeroHabitacion: hab.numeroHabitacion || "",
            precioNoche: hab.precioNoche || "",
            estadoHabitacion: hab.estadoHabitacion || "disponible",
            descripcion: hab.descripcion || "",
            idTipo: hab.datosTipoHabitacion?.id || "",
        });
        setShowModal(true);
    };

    // ── Guardar edición ──────────────────────────────────────
    const handleGuardar = async () => {
        if (!form.numeroHabitacion.trim()) {
            Swal.fire({ title: 'Campo requerido', text: 'El número de habitación es obligatorio.', icon: 'warning', confirmButtonColor: '#f38d1e' });
            return;
        }
        if (!form.precioNoche || parseFloat(form.precioNoche) <= 0) {
            Swal.fire({ title: 'Campo requerido', text: 'Ingresa un precio válido.', icon: 'warning', confirmButtonColor: '#f38d1e' });
            return;
        }

        const tipoSeleccionado = tipos.find(t => t.id === form.idTipo);
        const dto = {
            numeroHabitacion: form.numeroHabitacion.trim(),
            datosTipoHabitacion: tipoSeleccionado || habEditando.datosTipoHabitacion,
            precioNoche: parseFloat(form.precioNoche),
            estadoHabitacion: form.estadoHabitacion,
            descripcion: form.descripcion.trim() || null,
        };

        setLoadingGuardar(true);
        try {
            await actualizarHabitacion(habEditando.id, dto);
            setShowModal(false);
            await Swal.fire({
                title: '¡Actualizada!',
                text: `Habitación ${form.numeroHabitacion} actualizada correctamente.`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
            cargarDatos();
        } catch (err) {
            Swal.fire({ title: 'Error', text: err.message || 'No se pudo actualizar.', icon: 'error', confirmButtonColor: '#f38d1e' });
        } finally {
            setLoadingGuardar(false);
        }
    };

    // ── Eliminar ─────────────────────────────────────────────
    const handleEliminar = async (id, numero) => {
        const resultado = await Swal.fire({
            title: '¿Eliminar habitación?',
            html: `
                <p>La habitación <strong>${numero}</strong> será eliminada permanentemente.</p>
                <p style="color:#e53e3e;margin-top:8px;font-size:0.9rem">
                    Esta acción no se puede deshacer.
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
        try {
            await eliminarHabitacion(id);
            await Swal.fire({
                title: '¡Eliminada!',
                text: `Habitación ${numero} eliminada correctamente.`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
            cargarDatos();
        } catch (err) {
            Swal.fire({ title: 'Error', text: err.message || 'No se pudo eliminar.', icon: 'error', confirmButtonColor: '#f38d1e' });
        } finally {
            setEliminandoId(null);
        }
    };

    const getBadgeEstado = (estado) => {
        const map = {
            disponible:    { bg: "#e6f4ea", color: "#2e7d32", label: "✓ Disponible" },
            ocupada:       { bg: "#fce8e6", color: "#c62828", label: "✗ Ocupada" },
            mantenimiento: { bg: "#fff3e0", color: "#e65100", label: "⚙ Mantenimiento" },
        };
        return map[estado?.toLowerCase()] || { bg: "#f1f5f9", color: "#64748b", label: estado };
    };

    return (
        <Container fluid style={{ padding: "2.5rem" }}>

            {/* ── Header ───────────────────────────────────── */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 style={{ fontFamily: '"Bungee", sans-serif', fontWeight: 400, color: "#1a1a2e", fontSize: "2.2rem", marginBottom: "0.25rem" }}>
                        Gestión de <span style={{ color: "#f38d1e" }}>Habitaciones</span>
                    </h2>
                    <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0 }}>
                        ADMINISTRACIÓN — GOLDEN BOOKING
                    </p>
                </div>
                <Button
                    onClick={() => navigate("/crear-habitacion")}
                    style={{ background: "#f38d1e", border: "none", borderRadius: "10px", fontWeight: 700, padding: "0.6rem 1.4rem" }}
                >
                    + Crear Habitación
                </Button>
            </div>

            {/* ── Tabla ────────────────────────────────────── */}
            <div style={{ background: "#fff", borderRadius: "20px", padding: "2rem", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,.06)" }}>
                {loading ? (
                    <div className="d-flex justify-content-center py-5">
                        <Spinner style={{ color: "#f38d1e" }} />
                    </div>
                ) : habitaciones.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                        <span style={{ fontSize: "3rem" }}>🏨</span>
                        <p className="mt-3">No hay habitaciones registradas.</p>
                    </div>
                ) : (
                    <Table hover responsive style={{ fontSize: "0.875rem" }}>
                        <thead>
                            <tr style={{ background: "#1a1a2e", color: "#fff", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px" }}>
                                <th style={{ padding: "1rem 1.25rem", border: "none", borderRadius: "10px 0 0 10px" }}>Número</th>
                                <th style={{ padding: "1rem 1.25rem", border: "none" }}>Tipo</th>
                                <th style={{ padding: "1rem 1.25rem", border: "none" }}>Precio / noche</th>
                                <th style={{ padding: "1rem 1.25rem", border: "none" }}>Capacidad</th>
                                <th style={{ padding: "1rem 1.25rem", border: "none" }}>Estado</th>
                                <th style={{ padding: "1rem 1.25rem", border: "none", borderRadius: "0 10px 10px 0", textAlign: "center" }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {habitaciones.map((hab) => {
                                const estadoStyle = getBadgeEstado(hab.estadoHabitacion);
                                return (
                                    <tr key={hab.id}>
                                        <td style={{ padding: "1rem 1.25rem", verticalAlign: "middle", fontWeight: 700, color: "#1a1a2e" }}>
                                            {hab.numeroHabitacion}
                                        </td>
                                        <td style={{ padding: "1rem 1.25rem", verticalAlign: "middle", color: "#64748b" }}>
                                            {hab.datosTipoHabitacion?.nombreTipoHabitacion || "—"}
                                        </td>
                                        <td style={{ padding: "1rem 1.25rem", verticalAlign: "middle", fontWeight: 600, color: "#f38d1e" }}>
                                            ${hab.precioNoche?.toLocaleString("es-CO")}
                                        </td>
                                        <td style={{ padding: "1rem 1.25rem", verticalAlign: "middle" }}>
                                            <Badge style={{ background: "#fff3e0", color: "#f38d1e", fontWeight: 700, padding: "4px 12px", borderRadius: "20px" }}>
                                                👥 {hab.datosTipoHabitacion?.capacidadMaxima || "—"}
                                            </Badge>
                                        </td>
                                        <td style={{ padding: "1rem 1.25rem", verticalAlign: "middle" }}>
                                            <span style={{ background: estadoStyle.bg, color: estadoStyle.color, fontWeight: 700, fontSize: "0.78rem", padding: "4px 12px", borderRadius: "20px" }}>
                                                {estadoStyle.label}
                                            </span>
                                        </td>
                                        <td style={{ padding: "1rem 1.25rem", verticalAlign: "middle", textAlign: "center" }}>
                                            <div className="d-flex gap-2 justify-content-center">
                                                <button
                                                    onClick={() => handleEditar(hab)}
                                                    style={{ background: "none", border: "1.5px solid #e2e8f0", borderRadius: "8px", padding: "4px 10px", cursor: "pointer", fontSize: "1rem" }}
                                                    title="Editar"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleEliminar(hab.id, hab.numeroHabitacion)}
                                                    disabled={eliminandoId === hab.id}
                                                    style={{ background: "none", border: "1.5px solid #e2e8f0", borderRadius: "8px", padding: "4px 10px", cursor: "pointer", fontSize: "1rem" }}
                                                    title="Eliminar"
                                                >
                                                    {eliminandoId === hab.id ? <Spinner size="sm" /> : "🗑️"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                )}
                {habitaciones.length > 0 && (
                    <p style={{ fontSize: "0.8rem", color: "#94a3b8", textAlign: "right", margin: "1rem 0 0" }}>
                        {habitaciones.length} habitación{habitaciones.length !== 1 ? "es" : ""} registrada{habitaciones.length !== 1 ? "s" : ""}
                    </p>
                )}
            </div>

            {/* ── Modal Editar ─────────────────────────────── */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <Modal.Title style={{ fontWeight: 700, color: "#1a1a2e" }}>
                        Editar Habitación <span style={{ color: "#f38d1e" }}>{habEditando?.numeroHabitacion}</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: "2rem" }}>
                    <Row className="g-3">
                        <Col md={6}>
                            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#475569", marginBottom: "6px", display: "block" }}>Número de Habitación</label>
                            <Form.Control
                                value={form.numeroHabitacion}
                                onChange={e => setForm({ ...form, numeroHabitacion: e.target.value })}
                                style={{ borderRadius: "10px", border: "1.5px solid #e2e8f0" }}
                            />
                        </Col>
                        <Col md={6}>
                            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#475569", marginBottom: "6px", display: "block" }}>Tipo de Habitación</label>
                            <Form.Select
                                value={form.idTipo}
                                onChange={e => setForm({ ...form, idTipo: e.target.value })}
                                style={{ borderRadius: "10px", border: "1.5px solid #e2e8f0" }}
                            >
                                {tipos.map(t => (
                                    <option key={t.id} value={t.id}>{t.nombreTipoHabitacion}</option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col md={6}>
                            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#475569", marginBottom: "6px", display: "block" }}>Precio por Noche</label>
                            <Form.Control
                                type="number"
                                value={form.precioNoche}
                                onChange={e => setForm({ ...form, precioNoche: e.target.value })}
                                style={{ borderRadius: "10px", border: "1.5px solid #e2e8f0" }}
                            />
                        </Col>
                        <Col md={6}>
                            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#475569", marginBottom: "6px", display: "block" }}>Estado</label>
                            <Form.Select
                                value={form.estadoHabitacion}
                                onChange={e => setForm({ ...form, estadoHabitacion: e.target.value })}
                                style={{ borderRadius: "10px", border: "1.5px solid #e2e8f0" }}
                            >
                                {ESTADOS.map(e => (
                                    <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col md={12}>
                            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#475569", marginBottom: "6px", display: "block" }}>Descripción</label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={form.descripcion}
                                onChange={e => setForm({ ...form, descripcion: e.target.value })}
                                style={{ borderRadius: "10px", border: "1.5px solid #e2e8f0", resize: "none" }}
                            />
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer style={{ borderTop: "1px solid #e2e8f0" }}>
                    <Button variant="outline-secondary" onClick={() => setShowModal(false)} style={{ borderRadius: "10px" }}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleGuardar}
                        disabled={loadingGuardar}
                        style={{ background: "#f38d1e", border: "none", borderRadius: "10px", fontWeight: 700 }}
                    >
                        {loadingGuardar ? <><Spinner size="sm" className="me-2" />Guardando...</> : "Guardar Cambios"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}