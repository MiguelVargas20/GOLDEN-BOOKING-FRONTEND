import { useState } from "react";
import { Container, Row, Col, Form, Spinner, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { enviarMensaje } from "../api/ContactoApi";
import { useAuth } from "../context/AuthContext";
import '../styles/Contactos.css';
import mapa from '../assets/mapa.png';
import mapaimg from '../assets/mapa-img.png';

export default function Contactos() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const esAdmin = user?.role === "admin" || user?.esAdmin === true; 

    const [formData, setFormData] = useState({
        nombre: user?.nombreCompleto || "",
        correo: "",
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
            setFormData({ nombre: user?.nombreCompleto || "", correo: "", contenido: "" });
        } catch (err) {
            Swal.fire({ title: "Error", text: err.message || "No se pudo enviar el mensaje.", icon: "error", confirmButtonColor: "#f38d1e" });
        } finally {
            setEnviando(false);
        }
    };

    return (
        <Container className="my-4">
            {/* Cabecera con Título y Botón Admin alineados */}
            <Row className="align-items-center mb-4">
                <Col>
                    <h1 className="title-contacts m-0">CONTACTANOS</h1>
                </Col>
                {esAdmin && (
                    <Col xs="auto">
                        <Button 
                            variant="danger" 
                            onClick={() => navigate("/mensajes")}
                            style={{ backgroundColor: "#f38d1e", borderColor: "#f38d1e" }} // O mantén el de bootstrap
                        >
                            Ver Mensajes (Admin)
                        </Button>
                    </Col>
                )}
            </Row>

            {/* Caja contenedora principal del formulario y mapa */}
            <div className="contact-box p-4">
                <Form onSubmit={handleSubmit}>
                    <Row className="g-4"> {/* g-4 añade separación automática entre columnas */}
                        
                        {/* COLUMNA IZQUIERDA: FORMULARIO */}
                        <Col lg={6} md={12}>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="text"
                                    placeholder="Cuéntanos tu nombre"
                                    className="input-field nombre"
                                    value={formData.nombre}
                                    onChange={handleChange("nombre")}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="email"
                                    placeholder="Correo electrónico"
                                    className="input-field correo"
                                    value={formData.correo}
                                    onChange={handleChange("correo")}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    placeholder="Escribe tu mensaje"
                                    className="textarea-field mensaje"
                                    value={formData.contenido}
                                    onChange={handleChange("contenido")}
                                />
                            </Form.Group>

                            <button type="submit" className="btn-reservar w-100 mt-2" disabled={enviando}>
                                {enviando ? <Spinner size="sm" /> : "ENVIAR MENSAJE"}
                            </button>
                        </Col>

                        {/* COLUMNA DERECHA: MAPA */}
                        <Col lg={6} md={12} className="map-section d-flex flex-column justify-content-center align-items-center">
                            <div className="map-iframe w-100 text-center">
                                <img src={mapaimg} alt="Mapa" className="img-fluid" style={{ maxHeight: '250px', objectFit: 'cover' }} />
                            </div>
                            <img src={mapa} alt="mapa" className="map-marker mt-2" />
                        </Col>

                    </Row>
                </Form>
            </div>
        </Container>
    );
}