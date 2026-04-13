import React, { useState } from 'react';
import { Container, Card, Form, Button, InputGroup } from 'react-bootstrap';
import '../styles/TipoHabitacion.css';

const TipoHabitacion = () => {
    // 1. Estructura de Datos (useState)
    const [tipoHabitacion, setTipoHabitacion] = useState({
        nombreTipoHabitacion: '',
        descripcion: '',
        capacidadMaxima: 1
    });

    // 2. Lógica: Función handleChange dinámica
    const handleChange = (e) => {
        const { name, value } = e.target;
        setTipoHabitacion((prevState) => ({
            ...prevState,
            [name]: name === 'capacidadMaxima' ? parseInt(value) || 0 : value
        }));
    };

    // 3. Lógica: Función handleSubmit con Validación
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (tipoHabitacion.capacidadMaxima < 1) {
            alert('La capacidad máxima debe ser al menos 1.');
            return;
        }

        console.log('Datos del tipo de habitación registrados:', tipoHabitacion);
        alert('Tipo de habitación registrado con éxito (ver consola)');
    };

    return (
        <Container className="tipo-habitacion-container d-flex align-items-center justify-content-center min-vh-100">
            <Card className="tipo-habitacion-card shadow-lg border-0">
                <Card.Header className="tipo-habitacion-card-header text-white text-center py-4">
                    <h3 className="m-0 font-weight-bold">Registro Tipo de Habitación</h3>
                    <p className="small mb-0 opacity-75">CONFIGURACIÓN DE CATEGORÍAS</p>
                </Card.Header>
                <Card.Body className="p-4">
                    <Form onSubmit={handleSubmit}>
                        {/* Nombre del Tipo */}
                        <Form.Group className="mb-4" controlId="nombreTipoHabitacion">
                            <Form.Label className="fw-bold text-muted small text-uppercase">Nombre del Tipo</Form.Label>
                            <InputGroup className="custom-input-group">
                                <InputGroup.Text className="bg-light border-0">
                                    <i className="bi bi-tag"></i>
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Ej: Suite, Económica, Deluxe"
                                    name="nombreTipoHabitacion"
                                    value={tipoHabitacion.nombreTipoHabitacion}
                                    onChange={handleChange}
                                    className="border-0 bg-light p-3"
                                    required
                                />
                            </InputGroup>
                        </Form.Group>

                        {/* Descripción */}
                        <Form.Group className="mb-4" controlId="descripcion">
                            <Form.Label className="fw-bold text-muted small text-uppercase">Descripción</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Detalles de la categoría, servicios incluidos..."
                                name="descripcion"
                                value={tipoHabitacion.descripcion}
                                onChange={handleChange}
                                className="border-0 bg-light p-3"
                                required
                            />
                        </Form.Group>

                        {/* Capacidad Máxima */}
                        <Form.Group className="mb-4" controlId="capacidadMaxima">
                            <Form.Label className="fw-bold text-muted small text-uppercase">Capacidad Máxima</Form.Label>
                            <InputGroup className="custom-input-group">
                                <InputGroup.Text className="bg-light border-0">
                                    <i className="bi bi-people"></i>
                                </InputGroup.Text>
                                <Form.Control
                                    type="number"
                                    placeholder="Número de personas"
                                    name="capacidadMaxima"
                                    min="1"
                                    value={tipoHabitacion.capacidadMaxima}
                                    onChange={handleChange}
                                    className="border-0 bg-light p-3"
                                    required
                                />
                            </InputGroup>
                            <Form.Text className="text-muted small">
                                Mínimo 1 persona.
                            </Form.Text>
                        </Form.Group>

                        {/* Botón de Envío */}
                        <div className="d-grid gap-2 mt-5">
                            <Button variant="primary" type="submit" className="tipo-habitacion-submit-btn p-3 fw-bold border-0 shadow-sm">
                                Registrar Tipo <i className="bi bi-arrow-right ms-2"></i>
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default TipoHabitacion;