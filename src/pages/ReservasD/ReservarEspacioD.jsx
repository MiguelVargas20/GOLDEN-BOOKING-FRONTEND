import { useLocation, useNavigate } from "react-router-dom";
import { Form, Button, Row, Col, Badge } from "react-bootstrap";
import React, { useState, useEffect } from "react";
import { crearReservaDeporte } from "../../api/ReservaDeporteApi.js";
import { useAuth } from "../../context/AuthContext";
import { useReservasDeporte } from "../../hooks/useReservasDeporte";  // ← NUEVO
import Swal from "sweetalert2";                                        // ← NUEVO

function ReservarEspacioD() {
    const { state } = useLocation();
    const { ruta, text } = state || {};
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();

    // ── WebSocket ────────────────────────────────────────────
    const { estaOcupado, conectado, espaciosOcupados } = useReservasDeporte();
    const [bloqueadoEnVivo, setBloqueadoEnVivo] = useState(false);
    // ─────────────────────────────────────────────────────────

    const [formData, setFormData] = useState({
        tCancha: text || "",
        implAlquilados: "",
        rqrEntrenador: false,
        fInicioReserva: "",
        fFinReserva: "",
        docUsuario: user?.numeroDocumento || user?.id || ""
    });

    // ── Detectar en tiempo real si el espacio se ocupa ──────
    // Se ejecuta cada vez que llega un nuevo evento WebSocket
    useEffect(() => {
        if (!formData.fInicioReserva || !formData.tCancha) return;

        const ocupado = estaOcupado(formData.tCancha, formData.fInicioReserva);
        if (ocupado && !bloqueadoEnVivo) {
            setBloqueadoEnVivo(true);
            // Alerta automática si alguien más reservó mientras llenabas el form
            Swal.fire({
                title: '¡Espacio ocupado!',
                text: `La cancha de ${text} para ese horario acaba de ser reservada por otra persona.`,
                icon: 'warning',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#f38d1e',
            });
        } else if (!ocupado) {
            setBloqueadoEnVivo(false);
        }
    }, [espaciosOcupados, formData.fInicioReserva, formData.tCancha]);
    // ─────────────────────────────────────────────────────────

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Verificar en tiempo real antes de enviar
        if (bloqueadoEnVivo) {
            Swal.fire({
                title: 'Horario no disponible',
                text: 'Este espacio ya fue reservado. Por favor elige otro horario.',
                icon: 'error',
                confirmButtonColor: '#f38d1e',
            });
            return;
        }

        // Confirmación antes de reservar
        const confirmacion = await Swal.fire({
            title: '¿Confirmar reserva?',
            html: `
                <p><strong>Espacio:</strong> ${text}</p>
                <p><strong>Entrada:</strong> ${formData.fInicioReserva}</p>
                <p><strong>Salida:</strong> ${formData.fFinReserva}</p>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, reservar',
            cancelButtonText: 'Revisar',
            confirmButtonColor: '#f38d1e',
            cancelButtonColor: '#6c757d',
        });

        if (!confirmacion.isConfirmed) return;

        try {
            await crearReservaDeporte(formData);
            await Swal.fire({
                title: '¡Reserva confirmada!',
                text: 'Tu espacio quedó reservado exitosamente.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });
            navigate(isAdmin()
                ? "/reservas-deportivas/gestionar"
                : "/reservas-deportivas/mis-reservas");

        } catch (err) {
            // ← antes era setError(err.message)
            Swal.fire({
                title: 'No disponible',
                text: err.message || 'Error al conectar con el servidor.',
                icon: 'error',
                confirmButtonColor: '#f38d1e',
            });
        }
    }; // ← Se corrigió el cierre del bloque handleSubmit que estaba mezclado

    return (
        <div className='reserva-espacio-container p-4'>
            <div className="d-flex align-items-center justify-content-center gap-3 mb-4">
                <h2 className="text-center fw-bold mb-0">
                    RESERVAR ESPACIO: {text?.toUpperCase()}
                </h2>
                {/* Indicador de conexión WebSocket */}
                <Badge bg={conectado ? "success" : "secondary"} className="py-2 px-3">
                    {conectado ? "🟢 En vivo" : "⚪ Conectando..."}
                </Badge>
            </div>

            {/* Alerta si el horario seleccionado se ocupó en tiempo real */}
            {bloqueadoEnVivo && (
                <Alert variant="danger" className="text-center fw-bold">
                    ⚠️ Este horario acaba de ser reservado por otra persona. Por favor elige otro.
                </Alert>
            )}

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
                                    onChange={(e) => setFormData({ ...formData, implAlquilados: e.target.value })}
                                />
                            </Form.Group>

                            <Form.Check
                                type="switch"
                                label="¿Requiere un entrenador profesional?"
                                className="mb-3 fw-bold"
                                onChange={(e) => setFormData({ ...formData, rqrEntrenador: e.target.checked })}
                            />

                            <Row>
                                <Form.Group className="col-md-6 mb-3">
                                    <Form.Label className="fw-bold">Entrada</Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        onChange={(e) => setFormData({ ...formData, fInicioReserva: e.target.value })}
                                    />
                                </Form.Group>

                                <Form.Group className="col-md-6 mb-3">
                                    <Form.Label className="fw-bold">Salida</Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        onChange={(e) => setFormData({ ...formData, fFinReserva: e.target.value })}
                                    />
                                </Form.Group>
                            </Row>

                            <div className="d-flex gap-3 mt-4">
                                <Button
                                    type="submit"
                                    className="w-100 fw-bold border-0"
                                    disabled={bloqueadoEnVivo}  // ← desactiva si está ocupado
                                    style={{ backgroundColor: bloqueadoEnVivo ? '#6c757d' : '#f38d1e' }}
                                >
                                    {bloqueadoEnVivo ? 'HORARIO NO DISPONIBLE' : 'CONFIRMAR RESERVA'}
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