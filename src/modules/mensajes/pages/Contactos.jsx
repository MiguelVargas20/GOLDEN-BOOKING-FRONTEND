import { useState } from "react";
import { Row, Col, Form, Spinner } from "react-bootstrap";
import { BsInbox, BsChatDots, BsGeoAlt, BsEnvelope, BsTelephone } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { enviarMensaje } from "../api/ContactoApi";
import { useAuth } from "../../../shared/context/AuthContext";
import '../../../shared/styles/PanelAdmin.css';
import '../../../shared/styles/BotonesCompartidos.css';
import '../styles/Contactos.css';
import mapaimg from '../../../assets/mapa-img.png';

export default function Contactos() {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();

    const esAdmin = isAdmin();

    const [formData, setFormData] = useState({
        nombre: user?.nombreCompleto || "",
        correo: user?.email || "",
        contenido: "",
    });
    const [enviando, setEnviando] = useState(false);

    const handleChange = (campo) => (e) => {
        setFormData({ ...formData, [campo]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nombre.trim() || !formData.correo.trim() || !formData.contenido.trim()) {
            Swal.fire({ title: "Campos requeridos", text: "Completa nombre, correo y mensaje.", icon: "warning", confirmButtonColor: "#f38d1e" });
            return;
        }
        const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo);
        if (!correoValido) {
            Swal.fire({ title: "Correo inválido", text: "Ingresa un correo electrónico válido.", icon: "warning", confirmButtonColor: "#f38d1e" });
            return;
        }
        if (formData.contenido.trim().length < 5) {
            Swal.fire({ title: "Mensaje muy corto", text: "Cuéntanos un poco más en tu mensaje.", icon: "warning", confirmButtonColor: "#f38d1e" });
            return;
        }

        setEnviando(true);
        try {
            await enviarMensaje(formData);
            await Swal.fire({
                title: "¡Mensaje enviado!",
                text: "Gracias por escribirnos, te responderemos pronto.",
                icon: "success",
                timer: 2200,
                showConfirmButton: false,
            });
            setFormData({ nombre: user?.nombreCompleto || "", correo: user?.email || "", contenido: "" });
        } catch (err) {
            Swal.fire({ title: "Error", text: err.message || "No se pudo enviar el mensaje.", icon: "error", confirmButtonColor: "#f38d1e" });
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="gb-panel">
            <div className="gb-panel-header">
                <div>
                    <h1 className="gb-panel-titulo">Contác<span>tanos</span></h1>
                    <p className="gb-panel-subtitulo">¿Dudas sobre una reserva o algo que mejorar? Escríbenos y te respondemos por correo.</p>
                </div>
                <div className="gb-panel-acciones">
                    {esAdmin ? (
                        <button type="button" className="btn-gb btn-gb-neutral btn-gb-sm" onClick={() => navigate("/mensajes")}>
                            <BsInbox /> Bandeja de mensajes
                        </button>
                    ) : (
                        <button type="button" className="btn-gb btn-gb-neutral btn-gb-sm" onClick={() => navigate("/mis-mensajes")}>
                            <BsChatDots /> Mis mensajes
                        </button>
                    )}
                </div>
            </div>

            <Row className="g-4">
                <Col lg={7}>
                    <div className="gb-tarjeta">
                        <Form onSubmit={handleSubmit} noValidate className="gb-form">
                            <h2 className="gb-seccion-titulo">Envíanos un mensaje</h2>
                            <Form.Group className="mb-3">
                                <Form.Label htmlFor="ct-nombre">Nombre</Form.Label>
                                <Form.Control id="ct-nombre" type="text" maxLength={80} autoComplete="name"
                                    value={formData.nombre} onChange={handleChange("nombre")} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label htmlFor="ct-correo">Correo electrónico</Form.Label>
                                <Form.Control id="ct-correo" type="email" autoComplete="email" placeholder="usuario@correo.com"
                                    value={formData.correo} onChange={handleChange("correo")} />
                                <span className="gb-ayuda">Te responderemos a este correo.</span>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label htmlFor="ct-mensaje">Mensaje</Form.Label>
                                <Form.Control id="ct-mensaje" as="textarea" rows={6} maxLength={1000}
                                    placeholder="Cuéntanos en qué te podemos ayudar"
                                    value={formData.contenido} onChange={handleChange("contenido")} />
                                <span className="gb-ayuda">{formData.contenido.length}/1000</span>
                            </Form.Group>
                            <div className="gb-form-botones">
                                <button type="submit" className="btn-gb btn-gb-primary" disabled={enviando}>
                                    {enviando ? <><Spinner size="sm" /> Enviando…</> : "Enviar mensaje"}
                                </button>
                            </div>
                        </Form>
                    </div>
                </Col>

                <Col lg={5}>
                    <div className="gb-tarjeta ct-info">
                        <h2 className="gb-seccion-titulo">Dónde encontrarnos</h2>
                        <img src={mapaimg} alt="Mapa de la ubicación del club" className="ct-mapa" />
                        <ul className="ge-datos ct-datos">
                            <li><BsGeoAlt /> Club Valle Dorado</li>
                            <li><BsEnvelope /> contacto@valledorado.com</li>
                            <li><BsTelephone /> +502 5555-5555</li>
                        </ul>
                    </div>
                </Col>
            </Row>
        </div>
    );
}
