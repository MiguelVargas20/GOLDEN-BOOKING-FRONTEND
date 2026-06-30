import { useLocation, useNavigate } from "react-router-dom";
import { Form, Button, Row, Col, Badge, Alert } from "react-bootstrap";
import React, { useState, useEffect } from "react";
import { crearReservaDeporte } from "../../api/ReservaDeporteApi.js";
import { useAuth } from "../../context/AuthContext";
import { useReservasDeporte } from "../../hooks/useReservasDeporte";  
import Swal from "sweetalert2";                                        
import { BiCalendarAlt } from "react-icons/bi";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; 
import { es } from 'date-fns/locale'; 
import { useRequierePerfilCompleto } from "../../hooks/useRequirePerfilCompleto.js";

registerLocale("es", es); 

function ReservarEspacioD() {
    const { state } = useLocation();
    const { ruta, text } = state || {};
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();

    // ── WebSocket ────────────────────────────────────────────
    const { estaOcupado, conectado, espaciosOcupados } = useReservasDeporte();
    const [bloqueadoEnVivo, setBloqueadoEnVivo] = useState(false);
    // ─────────────────────────────────────────────────────────

    // ── Hook para verificar perfil completo ───────────────────
    const { verificarPerfil } = useRequierePerfilCompleto();

    const [formData, setFormData] = useState({
        tCancha: text || "",
        implAlquilados: "",
        rqrEntrenador: false,
        fInicioReserva: "",
        fFinReserva: "",
        docUsuario: ""
    });

    // ── Detectar en tiempo real si el espacio se ocupa ──────
    useEffect(() => {
        if (!formData.fInicioReserva || !formData.tCancha) return;

        const ocupado = estaOcupado(formData.tCancha, formData.fInicioReserva);
        if (ocupado && !bloqueadoEnVivo) {
            setBloqueadoEnVivo(true);
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

        // ── Validar perfil completo usando el Custom Hook Centralizado ──
        const docUsuario = verificarPerfil(user);
        if (!docUsuario) return; // Detiene la ejecución si el perfil está incompleto (el hook maneja el alert)

        // Verificar en tiempo real disponibilidad antes de enviar
        if (bloqueadoEnVivo) {
            Swal.fire({
                title: 'Horario no disponible',
                text: 'Este espacio ya fue reservado. Por favor elige otro horario.',
                icon: 'error',
                confirmButtonColor: '#f38d1e',
            });
            return;
        }

        // Validación básica de coherencia de fechas
        if (!formData.fInicioReserva || !formData.fFinReserva) {
            Swal.fire({
                title: 'Fechas requeridas',
                text: 'Por favor selecciona los horarios de entrada y salida.',
                icon: 'warning',
                confirmButtonColor: '#f38d1e'
            });
            return;
        }

        // Confirmación antes de reservar
        const confirmacion = await Swal.fire({
            title: '¿Confirmar reserva?',
            html: `
                <div style="text-align: left; padding: 0 1rem;">
                    <p><strong>Espacio:</strong> ${text}</p>
                    <p><strong>Entrada:</strong> ${new Date(formData.fInicioReserva).toLocaleString()}</p>
                    <p><strong>Salida:</strong> ${new Date(formData.fFinReserva).toLocaleString()}</p>
                </div>
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
            // Aseguramos el docUsuario correcto verificado por el hook justo antes de enviar 
            const datosReserva = { ...formData, docUsuario };

            await crearReservaDeporte(datosReserva);
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
            Swal.fire({
                title: 'No disponible',
                text: err.message || 'Error al conectar con el servidor.',
                icon: 'error',
                confirmButtonColor: '#f38d1e',
            });
        }
    }; 

    return (
        <div className='reserva-espacio-container p-4'>
            <div className="d-flex align-items-center justify-content-center gap-3 mb-4">
                <h2 className="text-center fw-bold mb-0">
                    RESERVAR ESPACIO: {text?.toUpperCase()}
                </h2>
                <Badge bg={conectado ? "success" : "secondary"} className="py-2 px-3">
                    {conectado ? "🟢 En vivo" : "⚪ Conectando..."}
                </Badge>
            </div>

            {bloqueadoEnVivo && (
                <Alert variant="danger" className="text-center fw-bold">
                    ⚠️ Este horario acaba de ser reservado por otra persona. Por favor elige otro.
                </Alert>
            )}

            <div className="reservar-espacio-card shadow p-4 rounded bg-white mx-auto" style={{ maxWidth: '900px' }}>
                <Row className="align-items-center">
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
                                <Col md={6} className="mb-3">
                                    <Form.Label className="fw-bold">Entrada</Form.Label>
                                    <div className="date-input-wrapper-sport">
                                        <BiCalendarAlt className="calendar-icon" />
                                        <DatePicker
                                            selected={formData.fInicioReserva ? new Date(formData.fInicioReserva) : null}
                                            onChange={(date) => setFormData({ ...formData, fInicioReserva: date ? date.toISOString() : "" })}
                                            showTimeSelect
                                            dateFormat="Pp"
                                            locale="es"
                                            className="form-control custom-date-input"
                                            placeholderText="dd/mm/aaaa --:--"
                                            minDate={new Date()}
                                        />
                                    </div>
                                </Col>

                                <Col md={6} className="mb-3">
                                    <Form.Label className="fw-bold">Salida</Form.Label>
                                    <div className="date-input-wrapper-sport">
                                        <BiCalendarAlt className="calendar-icon" />
                                        <DatePicker
                                            selected={formData.fFinReserva ? new Date(formData.fFinReserva) : null}
                                            onChange={(date) => setFormData({ ...formData, fFinReserva: date ? date.toISOString() : "" })}
                                            showTimeSelect
                                            dateFormat="Pp"
                                            locale="es"
                                            className="form-control custom-date-input"
                                            placeholderText="dd/mm/aaaa --:--"
                                            minDate={formData.fInicioReserva ? new Date(formData.fInicioReserva) : new Date()}
                                        />
                                    </div>
                                </Col>
                            </Row>

                            <div className="d-flex gap-3 mt-4">
                                <Button
                                    type="submit"
                                    className="w-100 fw-bold border-0"
                                    disabled={bloqueadoEnVivo}  
                                    style={{ backgroundColor: bloqueadoEnVivo ? '#6c757d' : '#f38d1e' }}
                                >
                                    {bloqueadoEnVivo ? 'HORARIO NO DISPONIBLE' : 'CONFIRMAR RESERVA'}
                                </Button>
                                <Button variant="outline-secondary" className="w-100" onClick={() => navigate(-1)}>
                                    Cancelar
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