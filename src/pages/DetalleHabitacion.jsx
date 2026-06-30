import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner, Button, Container, Row, Col, Card } from "react-bootstrap";
import { BiArrowBack, BiGroup, BiCalendar } from "react-icons/bi";
import { obtenerHabitacionPorId } from "../api/HabitacionApi";
import { crearReservaHotel } from "../api/ReservaHotelApi";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";
import "../styles/DetalleHabitacion.css";

const PLACEHOLDER = "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80";

export default function DetalleHabitacion() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [habitacion, setHabitacion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [reservando, setReservando] = useState(false);

    useEffect(() => {
        const cargar = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await obtenerHabitacionPorId(id);
                setHabitacion(data);
            } catch (err) {
                console.error(err);
                setError("No se pudo encontrar esta habitación. Puede que ya no exista o el enlace sea inválido.");
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, [id]);

    const calcularNochesYTotal = () => {
        if (!checkIn || !checkOut || !habitacion) return { noches: 0, total: 0 };
        const inicio = new Date(checkIn);
        const fin = new Date(checkOut);
        const noches = Math.round((fin - inicio) / (1000 * 60 * 60 * 24));
        if (noches <= 0) return { noches: 0, total: 0 };
        return { noches, total: noches * (habitacion.precioNoche || 0) };
    };

    const handleReservar = async () => {
        if (!checkIn || !checkOut) {
            Swal.fire({ title: "Fechas requeridas", text: "Selecciona check-in y check-out.", icon: "warning", confirmButtonColor: "#f38d1e" });
            return;
        }
        if (new Date(checkIn) >= new Date(checkOut)) {
            Swal.fire({ title: "Fechas inválidas", text: "El check-out debe ser posterior al check-in.", icon: "warning", confirmButtonColor: "#f38d1e" });
            return;
        }

        const docUsuario = user?.numeroDocumento;
        if (!docUsuario) {
            const r = await Swal.fire({
                title: "Perfil incompleto",
                text: "No se encontró tu número de documento. Actualiza tu perfil antes de reservar.",
                icon: "error",
                confirmButtonColor: "#f38d1e",
                showCancelButton: true,
                confirmButtonText: "Completar perfil",
                cancelButtonText: "Cerrar",
            });
            if (r.isConfirmed) navigate("/mi-perfil");
            return;
        }

        const { noches, total } = calcularNochesYTotal();

        const confirmacion = await Swal.fire({
            title: "¿Confirmar reserva?",
            html: `
                <div style="text-align:left;padding:0 1rem">
                    <p><strong>Habitación:</strong> ${habitacion.numeroHabitacion}</p>
                    <p><strong>Check-in:</strong> ${new Date(checkIn).toLocaleDateString()}</p>
                    <p><strong>Check-out:</strong> ${new Date(checkOut).toLocaleDateString()}</p>
                    <p><strong>Noches:</strong> ${noches}</p>
                    <hr>
                    <p style="font-size:1.2rem;color:#f38d1e"><strong>Total: $${total.toLocaleString("es-CO")}</strong></p>
                </div>
            `,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, reservar",
            cancelButtonText: "Revisar",
            confirmButtonColor: "#f38d1e",
            cancelButtonColor: "#6c757d",
        });
        if (!confirmacion.isConfirmed) return;

        setReservando(true);
        try {
            await crearReservaHotel({
                docUsuario,
                idHabitacion: habitacion.id,
                fCheckIn: new Date(checkIn).toISOString(),
                fCheckOut: new Date(checkOut).toISOString(),
            });
            await Swal.fire({
                title: "¡Reserva confirmada!",
                text: `Tu reserva para la habitación ${habitacion.numeroHabitacion} fue creada exitosamente.`,
                icon: "success",
                timer: 2500,
                showConfirmButton: false,
            });
            navigate("/mis-reservas-hotel");
        } catch (err) {
            Swal.fire({ title: "No se pudo reservar", text: err.message || "Error al crear la reserva.", icon: "error", confirmButtonColor: "#f38d1e" });
        } finally {
            setReservando(false);
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <Spinner animation="border" style={{ color: "#c9a84c" }} />
        </div>
    );

    // ── Estado de error: ya no asumimos que `habitacion` existe ──
    if (error || !habitacion) {
        return (
            <Container className="main-container golden-booking-layout py-5 text-center">
                <h3 className="mb-3">😕 {error || "Habitación no encontrada."}</h3>
                <Button className="btn-detail" onClick={() => navigate("/reservas-hospedaje")}>
                    <BiArrowBack /> Volver al catálogo
                </Button>
            </Container>
        );
    }

    const disponible =
        habitacion.estadoHabitacion?.toLowerCase() === "disponible";
    const { noches, total } = calcularNochesYTotal();

    return (
        <Container className="main-container golden-booking-layout py-5">
            <Button variant="link" className="btn-detail mb-4" onClick={() => navigate(-1)}>
                <BiArrowBack /> Volver al listado
            </Button>

            <Card className="hotel-card">
                <Row className="g-0">
                    <Col md={6} className="hotel-image-container">
                        <img
                            src={habitacion.imagenUrl || PLACEHOLDER}
                            className="hotel-image"
                            alt="Habitación"
                            onError={(e) => { e.target.src = PLACEHOLDER }}
                        />
                    </Col>

                    <Col md={6} className="hotel-info-block p-5">
                        <div className="hotel-header d-flex justify-content-between align-items-start">
                            <h4>{habitacion.numeroHabitacion}</h4>
                            <span className={`status-tag-v2 ${disponible ? "disponible" : "no-disponible"}`}>
                                {disponible ? "✓ Disponible" : "✗ No disponible"}
                            </span>
                        </div>
                        <h4 className="text-muted mb-4">{habitacion.datosTipoHabitacion?.nombreTipoHabitacion}</h4>

                        <p className="room-description mb-4">{habitacion.descripcion || "Disfruta de una estancia inolvidable."}</p>

                        <div className="details-boxes">
                            <div className="details-box"><BiGroup /> Capacidad: {habitacion.datosTipoHabitacion?.capacidadMaxima} Pers.</div>
                            <div className="details-box"><BiCalendar /> WiFi: Incluido</div>
                        </div>

                        {/* ── Selección de fechas in-situ ── */}
                        <Row className="g-2 mt-4">
                            <Col xs={6}>
                                <label className="small fw-semibold text-muted">Check-in</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={checkIn}
                                    min={new Date().toISOString().split("T")[0]}
                                    onChange={(e) => setCheckIn(e.target.value)}
                                />
                            </Col>
                            <Col xs={6}>
                                <label className="small fw-semibold text-muted">Check-out</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={checkOut}
                                    min={checkIn || new Date().toISOString().split("T")[0]}
                                    onChange={(e) => setCheckOut(e.target.value)}
                                />
                            </Col>
                        </Row>

                        <div className="price-block mt-4">
                            <span className="base-price">
                                ${noches > 0 ? total.toLocaleString("es-CO") : (habitacion.precioNoche?.toLocaleString("es-CO") || 0)}
                            </span>
                            <span className="price-label"> {noches > 0 ? `(${noches} noche${noches !== 1 ? "s" : ""})` : "/ noche"}</span>
                        </div>

                        <Button
                            className="btn-reservar w-100 mt-4"
                            onClick={handleReservar}
                            disabled={!disponible || reservando}
                        >
                            {reservando ? <Spinner size="sm" /> : disponible ? "Reservar Ahora" : "No disponible"}
                        </Button>
                    </Col>
                </Row>
            </Card>
        </Container>
    );
}