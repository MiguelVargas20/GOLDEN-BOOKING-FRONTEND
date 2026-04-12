import { useLocation, useNavigate } from "react-router-dom";
import { Form, Button, Alert } from "react-bootstrap";
import React, { useState } from "react";
import { crearReservaDeporte } from "../../api/reservaDeporteApi";

function ReservarEspacioD() {
    const { state } = useLocation();
    const { ruta, text } = state || {}; // Aquí recibimos la imagen y el nombre del deporte
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        tCancha: text || "",
        implAlquilados: "",
        rqrEntrenador: false,
        fInicioReserva: "",
        fFinReserva: "",
        docUsuario: "123456" // Reemplazar con el documento del usuario logueado
    });

    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const fechaInicio = new Date(formData.fInicioReserva);
        const fechaFin = new Date(formData.fFinReserva);
        const ahora = new Date();

        // VALIDACIÓN FRONT: Campos vacíos
        if (!formData.fInicioReserva || !formData.fFinReserva) {
            setError("Por favor, selecciona las fechas de entrada y salida.");
            return;
        }

        // VALIDACIÓN FRONT: Fecha pasada
        if (fechaInicio < ahora) {
            setError("No puedes realizar una reserva en una fecha pasada.");
            return;
        }

        // VALIDACIÓN FRONT: Orden de fechas
        if (fechaFin <= fechaInicio) {
            setError("La fecha de salida debe ser posterior a la de entrada.");
            return;
        }

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
            {/* El nombre del deporte aparece dinámicamente */}
            <h2 className="text-center mb-4">RESERVAR ESPACIO: {text?.toUpperCase()}</h2>

            {error && <Alert variant="danger">⚠️ {error}</Alert>}

            <div className="reservar-espacio-form shadow p-4 rounded bg-white mx-auto" style={{ maxWidth: '600px' }}>
                <div className="img-detalle text-center mb-4">
                    {/* La imagen de la cancha seleccionada aparece aquí */}
                    <img src={ruta} alt={text} className="img-fluid rounded shadow-sm" style={{ maxHeight: '250px' }}/>
                </div>

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

                    <div className="row">
                        <Form.Group className="col-md-6 mb-3">
                            <Form.Label className="fw-bold">Fecha y Hora Entrada</Form.Label>
                            <Form.Control 
                                type="datetime-local" 
                                className={error && !formData.fInicioReserva ? "border-danger" : ""}
                                onChange={(e) => setFormData({...formData, fInicioReserva: e.target.value})}
                            />
                        </Form.Group>

                        <Form.Group className="col-md-6 mb-3">
                            <Form.Label className="fw-bold">Fecha y Hora Salida</Form.Label>
                            <Form.Control 
                                type="datetime-local" 
                                className={error && !formData.fFinReserva ? "border-danger" : ""}
                                onChange={(e) => setFormData({...formData, fFinReserva: e.target.value})}
                            />
                        </Form.Group>
                    </div>

                    <div className="d-flex gap-3 mt-4">
                        <Button type="submit" variant="success" className="w-100 fw-bold">
                            CONFIRMAR RESERVA
                        </Button>
                        <Button variant="outline-secondary" className="w-100" onClick={() => navigate(-1)}>
                            CANCELAR
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    );
}

export default ReservarEspacioD;