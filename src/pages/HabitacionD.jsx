import React, { useState } from 'react';
import { Container, Card, Form, Button, InputGroup, Row, Col } from 'react-bootstrap';
import '../styles/HabitacionD.css';

const HabitacionD = () => {
    // 1. Estructura de Datos (useState)
    const [habitacion, setHabitacion] = useState({
        numeroHabitacion: '',
        precioNoche: 0,
        estadoHabitacion: 'disponible',
        descripcion: ''
    });

    // 2. Lógica: Función handleChange dinámica
    const handleChange = (e) => {
        const { name, value } = e.target;
        setHabitacion((prevState) => ({
            ...prevState,
            [name]: name === 'precioNoche' ? parseFloat(value) || 0 : value
        }));
    };

    // 3. Lógica: Función handleSubmit
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Datos de la habitación registrados:', habitacion);
        alert('Habitación registrada con éxito (ver consola)');
    };

    return (
        <Container className="habitacion-container d-flex align-items-center justify-content-center min-vh-100">
            <Card className="habitacion-card shadow-lg border-0">
                <Card.Header className="habitacion-card-header text-white text-center py-4">
                    <h3 className="m-0 font-weight-bold">Registro de Habitación</h3>
                    <p className="small mb-0 opacity-75">GESTIÓN EJECUTIVA DE PROPIEDADES</p>
                </Card.Header>
                <Card.Body className="p-4">
                    <Form onSubmit={handleSubmit}>
                        {/* Número de Habitación */}
                        <Form.Group className="mb-4" controlId="numeroHabitacion">
                            <Form.Label className="fw-bold text-muted small text-uppercase">Número de Habitación</Form.Label>
                            <InputGroup className="custom-input-group">
                                <InputGroup.Text className="bg-light border-0">
                                    <i className="bi bi-door-closed"></i>
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Ej: 402-A"
                                    name="numeroHabitacion"
                                    value={habitacion.numeroHabitacion}
                                    onChange={handleChange}
                                    className="border-0 bg-light p-3"
                                    required
                                />
                            </InputGroup>
                        </Form.Group>

                        {/* Precio por Noche */}
                        <Form.Group className="mb-4" controlId="precioNoche">
                            <Form.Label className="fw-bold text-muted small text-uppercase">Precio por Noche</Form.Label>
                            <InputGroup className="custom-input-group">
                                <InputGroup.Text className="bg-light border-0 fw-bold">$</InputGroup.Text>
                                <Form.Control
                                    type="number"
                                    placeholder="0.00"
                                    name="precioNoche"
                                    value={habitacion.precioNoche}
                                    onChange={handleChange}
                                    className="border-0 bg-light p-3"
                                    required
                                />
                            </InputGroup>
                        </Form.Group>

                        {/* Estado de la Habitación */}
                        <Form.Group className="mb-4" controlId="estadoHabitacion">
                            <Form.Label className="fw-bold text-muted small text-uppercase">Estado de la Habitación</Form.Label>
                            <InputGroup className="custom-input-group">
                                <InputGroup.Text className="bg-light border-0">
                                    <i className="bi bi-info-circle"></i>
                                </InputGroup.Text>
                                <Form.Select
                                    name="estadoHabitacion"
                                    value={habitacion.estadoHabitacion}
                                    onChange={handleChange}
                                    className="border-0 bg-light p-3"
                                >
                                    <option value="disponible">Disponible</option>
                                    <option value="mantenimiento">En Mantenimiento</option>
                                </Form.Select>
                            </InputGroup>
                        </Form.Group>

                        {/* Descripción */}
                        <Form.Group className="mb-4" controlId="descripcion">
                            <Form.Label className="fw-bold text-muted small text-uppercase">Descripción</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Detalles de la suite, comodidades y vista..."
                                name="descripcion"
                                value={habitacion.descripcion}
                                onChange={handleChange}
                                className="border-0 bg-light p-3"
                            />
                        </Form.Group>

                        {/* Botón de Envío */}
                        <div className="d-grid gap-2 mt-5">
                            <Button variant="primary" type="submit" className="habitacion-submit-btn p-3 fw-bold border-0 shadow-sm">
                                Finalizar Registro <i className="bi bi-arrow-right ms-2"></i>
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default HabitacionD;
