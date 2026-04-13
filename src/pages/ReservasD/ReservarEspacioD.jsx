import { useLocation, useNavigate } from "react-router-dom";
import { Form, Button, Alert, Row, Col } from "react-bootstrap"; // Añadido Row y Col
import React, { useState } from "react";
import { crearReservaDeporte } from "../../api/ReservaDeporteApi.js";
import { useAuth } from "../../context/AuthContext";

function ReservarEspacioD() {
    const { state } = useLocation();
    const { ruta, text } = state || {};
    const navigate = useNavigate();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        tCancha: text || "",
        implAlquilados: "",
        rqrEntrenador: false,
        fInicioReserva: "",
        fFinReserva: "",
        docUsuario: user?.id || ""
    });

    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        // ... (tu lógica de validación se mantiene igual)
        try {
            await crearReservaDeporte(formData);
            alert("¡Reserva guardada con éxito!");
            navigate("/reservas-deportivas/gestionar");
        } catch (err) {
            setError(err.message || "Error al conectar con el servidor.");
        }
    };

    return (
        <div className='reserva-espacio-container p-4'>
            <h2 className="text-center mb-4 fw-bold">RESERVAR ESPACIO: {text?.toUpperCase()}</h2>

            {error && <Alert variant="danger">⚠️ {error}</Alert>}

            {/* Aumentamos el ancho máximo para dar espacio a las dos columnas */}
            <div className="reservar-espacio-card shadow p-4 rounded bg-white mx-auto" style={{ maxWidth: '900px' }}>
                <Row className="align-items-center">
                    {/* COLUMNA IZQUIERDA: Imagen */}
                    <Col md={5} className="mb-4 mb-md-0">
                        <div className="img-detalle text-center">
                            <img 
                                src={ruta} 
                                alt={text} 
                                className="img-fluid rounded shadow-sm w-100" 
                                style={{ objectFit: 'cover', minHeight: '300px' }}
                            />
                        </div>
                    </Col>

                    {/* COLUMNA DERECHA: Formulario */}
                    <Col md={7}>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Implementos Adicionales</Form.Label>
                                <Form.Control 
                                    placeholder="Ej: Balones de fútbol, raquetas..." 
                                    onChange={(e) => setFormData({...formData, implAlquilados: e.target.value})}
                                />
                            </Form.Group>

                            <Form.Check 
                                type="switch"
                                label="¿Requiere un entrenador profesional?"
                                className="mb-3 fw-bold"
                                onChange={(e) => setFormData({...formData, rqrEntrenador: e.target.checked})}
                            />

                            <Row>
                                <Form.Group className="col-md-6 mb-3">
                                    <Form.Label className="fw-bold">Entrada</Form.Label>
                                    <Form.Control 
                                        type="datetime-local" 
                                        onChange={(e) => setFormData({...formData, fInicioReserva: e.target.value})}
                                    />
                                </Form.Group>

                                <Form.Group className="col-md-6 mb-3">
                                    <Form.Label className="fw-bold">Salida</Form.Label>
                                    <Form.Control 
                                        type="datetime-local" 
                                        onChange={(e) => setFormData({...formData, fFinReserva: e.target.value})}
                                    />
                                </Form.Group>
                            </Row>

                            <div className="d-flex gap-3 mt-4">
                                <Button type="submit" variant="success" className="w-100 fw-bold">
                                    CONFIRMAR
                                </Button>
                                <Button variant="outline-secondary" className="w-100" onClick={() => navigate(-1)}>
                                    CANCELAR
                                </Button>
                            </div>
                        </Form>
                    </Col>
                </Row>
            </div>
        </div>
    );
}

export default ReservarEspacioD;