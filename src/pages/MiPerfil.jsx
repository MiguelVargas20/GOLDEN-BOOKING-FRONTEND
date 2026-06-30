import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Spinner } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { actualizarMiPerfil } from "../api/UserApi";
import Swal from "sweetalert2";
import userImg from "../assets/edit-user.png";

const API_URL = import.meta.env.VITE_API_URL;

export default function MiPerfil() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [perfil, setPerfil]   = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving]   = useState(false);

    const [formData, setFormData] = useState({
        nombre:   "",
        apellido: "",
        telefono: "",
        correo:   "",
    });

    // ── Carga datos reales del back al abrir ─────────────
    useEffect(() => {
        const cargarPerfil = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${API_URL}/api/usuarios/perfil/${user.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) throw new Error("No se pudo cargar el perfil");
                const data = await res.json();
                setPerfil(data);
                setFormData({
                    nombre:   data.nombre   || "",
                    apellido: data.apellido || "",
                    telefono: data.telefono || "",
                    correo:   data.email    || "",
                });
            } catch (err) {
                Swal.fire({
                    title: "Error",
                    text: "No se pudo cargar tu perfil.",
                    icon: "error",
                    confirmButtonColor: "#f38d1e"
                });
            } finally {
                setLoading(false);
            }
        };
        if (user?.id) cargarPerfil();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nombre.trim() || !formData.apellido.trim()) {
            Swal.fire({ title: "Campo requerido", text: "Nombre y apellido son obligatorios.", icon: "warning", confirmButtonColor: "#f38d1e" });
            return;
        }

        const confirmacion = await Swal.fire({
            title: "¿Guardar cambios?",
            text: "Tu perfil será actualizado.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, guardar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#f38d1e",
            cancelButtonColor: "#6c757d",
        });
        if (!confirmacion.isConfirmed) return;

        setSaving(true);
        try {
            await actualizarMiPerfil(user.id, formData);
            await Swal.fire({
                title: "¡Perfil actualizado!",
                text: "Tus datos fueron guardados correctamente.",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
            });
            navigate(-1);
        } catch (err) {
            Swal.fire({
                title: "Error",
                text: err.message || "No se pudo actualizar el perfil.",
                icon: "error",
                confirmButtonColor: "#f38d1e",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
            <Spinner style={{ color: "#f38d1e" }} />
        </div>
    );

    return (
        <div className="editar-page">
            <div className="editar-page-header">
                <h1 className="editar-page-title">MI PERFIL</h1>
                <span className="editar-page-id">ID: {user?.id?.slice(-6)}</span>
            </div>

            <div className="editar-page-body">
                <Row className="align-items-center w-100">

                    {/* Avatar */}
                    <Col md={3} className="text-center">
                        <div className="editar-avatar">
                            <img src={userImg} alt="perfil" className="editar-avatar-img" />
                        </div>
                        <p className="editar-avatar-label">{user?.nombreCompleto}</p>
                        <span style={{
                            background: "#f38d1e", color: "#fff",
                            fontSize: "0.75rem", fontWeight: 700,
                            padding: "3px 12px", borderRadius: "20px"
                        }}>
                            {user?.roles?.[0] || "CLIENTE"}
                        </span>
                    </Col>

                    {/* Formulario */}
                    <Col md={9}>
                        <Form onSubmit={handleSubmit}>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Label className="editar-label">Nombre</Form.Label>
                                    <Form.Control
                                        className="editar-input"
                                        value={formData.nombre}
                                        onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                    />
                                </Col>
                                <Col md={6}>
                                    <Form.Label className="editar-label">Apellido</Form.Label>
                                    <Form.Control
                                        className="editar-input"
                                        value={formData.apellido}
                                        onChange={e => setFormData({ ...formData, apellido: e.target.value })}
                                    />
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Label className="editar-label">Teléfono</Form.Label>
                                    <Form.Control
                                        className="editar-input"
                                        value={formData.telefono}
                                        onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                                    />
                                </Col>
                                <Col md={6}>
                                    <Form.Label className="editar-label">Correo electrónico</Form.Label>
                                    <Form.Control
                                        type="email"
                                        className="editar-input"
                                        value={formData.correo}
                                        onChange={e => setFormData({ ...formData, correo: e.target.value })}
                                    />
                                </Col>
                            </Row>

                            <div className="editar-botones">
                                <button type="submit" className="editar-btn-guardar" disabled={saving}>
                                    {saving ? "Guardando..." : "Guardar Cambios"}
                                </button>
                                <button type="button" className="editar-btn-cancelar" onClick={() => navigate(-1)}>
                                    Cancelar
                                </button>
                            </div>
                        </Form>
                    </Col>
                </Row>
            </div>
        </div>
    );
}