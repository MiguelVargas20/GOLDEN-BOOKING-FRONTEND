import React from 'react';
import { Container, Row, Col, Card, Form, Button, ListGroup, InputGroup } from 'react-bootstrap';
import '../styles/CheckoutPage.css';

const ReservaPagoPC = () => {
    return (
        <div className="min-h-screen bg-white py-10">
            <Container>
                {/* Botón Volver */}
                <div className="mb-4 text-orange-700 font-medium cursor-pointer flex items-center">
                    <span className="mr-2">←</span> Volver a la selección
                </div>

                <Row>
                    <Col md={8} className="pr-md-5">
                        <h2 className="text-4xl mb-2">Finaliza tu reserva</h2>
                        <p className="text-muted mb-5">Estás a un paso de comenzar tu estancia en el refugio perfecto.</p>

                        {/* Sección 01 */}
                        <div className="d-flex align-items-center mb-4">
                            <div className="section-icon">👤</div>
                            <h4 className="m-0 font-bold">Información del Huésped</h4>
                        </div>

                        <Row className="mb-5">
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nombre completo</Form.Label>
                                    <Form.Control placeholder="Ej. Julian Casablancas" />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Correo electrónico</Form.Label>
                                    <Form.Control placeholder="julian@refugio.com" />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Sección 02 */}
                        <div className="d-flex align-items-center mb-4">
                            <div className="section-icon">💳</div>
                            <h4 className="m-0 font-bold">Método de Pago</h4>
                        </div>

                        <div className="payment-methods-grid">
                            <div className="method-card active">
                                <span className="fs-4">💳</span>
                                <span className="small font-bold">Tarjeta</span>
                            </div>
                            <div className="method-card">
                                <span className="fs-4">📱</span>
                                <span className="small">Digital Wallet</span>
                            </div>
                            <div className="method-card">
                                <span className="fs-4">🏦</span>
                                <span className="small">Transferencia</span>
                            </div>
                        </div>

                        <Card className="card-payment-details mb-4">
                            <Card.Body>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-muted">Número de tarjeta</Form.Label>
                                    <InputGroup className="bg-white rounded-3">
                                        <Form.Control className="bg-white border-0" placeholder="0000 0000 0000 0000" />
                                        <InputGroup.Text className="bg-white border-0 text-muted">💳</InputGroup.Text>
                                    </InputGroup>
                                </Form.Group>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="text-muted">Vencimiento</Form.Label>
                                            <Form.Control placeholder="MM/AA" />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="text-muted">CVV</Form.Label>
                                            <Form.Control placeholder="123" />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        <div className="d-flex align-items-center text-muted small p-3 bg-light rounded-4">
                            <span className="mr-3 fs-5">🛡️</span>
                            <div>
                                <strong>Garantía de Reserva Segura</strong><br />
                                Tus datos están protegidos por encriptación de grado bancario de 256 bits.
                            </div>
                        </div>
                    </Col>

                    {/* SIDEBAR RESUMEN (Sin lg={4}) */}
                    <Col md={4}>
                        <Card className="summary-card sticky-top">
                            <div className="position-relative">
                                <img
                                    src="https://images.unsplash.com/photo-1590392848650-3224b48b6283?auto=format&fit=crop&q=80&w=800"
                                    className="summary-img w-100"
                                    alt="Room"
                                />
                                <span className="badge-room">Standard Suite</span>
                            </div>
                            <Card.Body className="p-4">
                                <h4 className="font-bold mb-4">Resumen de tu estancia</h4>
                                <div className="d-flex justify-content-between mb-3 small border-bottom pb-3">
                                    <div>
                                        <div className="text-muted uppercase text-xs">Check-in</div>
                                        <div className="font-bold">12 de Mayo, 2024</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-muted uppercase text-xs text-right">Check-out</div>
                                        <div className="font-bold">15 de Mayo, 2024</div>
                                    </div>
                                </div>

                                <div className="text-muted small mb-4">🌙 3 noches • 2 adultos</div>

                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Suite Standard (3 noches)</span>
                                    <span className="font-bold">$450.00</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Cargos por servicio</span>
                                    <span className="font-bold">$35.00</span>
                                </div>
                                <div className="d-flex justify-content-between mb-4">
                                    <span className="text-muted">Impuestos hoteleros</span>
                                    <span className="font-bold">$12.50</span>
                                </div>

                                <div className="d-flex justify-content-between align-items-center pt-3 border-top mb-4">
                                    <span className="h5 m-0 font-bold">Total</span>
                                    <span className="h2 m-0 font-extrabold text-orange-600">$497.50</span>
                                </div>

                                <Button className="btn-pay w-100">
                                    Confirmar y Pagar →
                                </Button>
                                <p className="text-center text-xs text-muted mt-3 px-3">
                                    Al hacer clic en el botón superior, aceptas nuestros términos de servicio y políticas.
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ReservaPagoPC;