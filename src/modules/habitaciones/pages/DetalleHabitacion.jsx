import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner, Button, Container, Row, Col, Card } from "react-bootstrap";
import { BiArrowBack, BiGroup, BiCalendar, BiCalendarAlt } from "react-icons/bi";
import { obtenerHabitacionPorId } from "../api/HabitacionApi";
import { crearReservaHotel, obtenerFechasOcupadas } from "../../reservasHoteleras/api/ReservaHotelApi";
import { haySolapamiento, toLocalDateString } from "../../reservasHoteleras/utils/fechasHotel";
import { aFecha, aInicioDelDiaLocal, nochesEntre } from "../../../shared/utils/fechas";
import { useAuth } from "../../../shared/context/AuthContext";
import { datosTipo } from "../utils/tipoHabitacion";
import { imagenHabitacion, usarImagenDeRespaldoHabitacion } from "../utils/imagenHabitacion";
import Swal from "sweetalert2";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../../shared/styles/DatePickerCompartido.css";
import { es } from "date-fns/locale";
import "../styles/DetalleHabitacion.css";
import { useRequierePerfilCompleto } from "../../../shared/hooks/useRequirePerfilCompleto";
import { escapeHtml } from "../../../shared/utils/escapeHtml";

registerLocale("es", es);

export default function DetalleHabitacion() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { verificarPerfil } = useRequierePerfilCompleto();

    const [habitacion, setHabitacion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [reservando, setReservando] = useState(false);

    const [rangosOcupados, setRangosOcupados] = useState([]); // 🆕

    useEffect(() => {
        const cargar = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await obtenerHabitacionPorId(id);
                setHabitacion(data);

                // 🆕 Traemos las fechas ya ocupadas de ESTA habitación.
                // Si falla (ej. red), no bloqueamos la vista: simplemente
                // la validación en el submit y el backend siguen siendo
                // la red de seguridad.
                try {
                    const ocupadas = await obtenerFechasOcupadas(id);
                    setRangosOcupados(ocupadas);
                } catch (errFechas) {
                    console.error("No se pudieron cargar fechas ocupadas:", errFechas);
                }
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
        const noches = nochesEntre(checkIn, checkOut);
        if (noches <= 0) return { noches: 0, total: 0 };
        return { noches, total: noches * (habitacion.precioNoche || 0) };
    };

    const handleReservar = async () => {
        if (!checkIn || !checkOut) {
            Swal.fire({ title: "Fechas requeridas", text: "Selecciona check-in y check-out.", icon: "warning", confirmButtonColor: "#f38d1e" });
            return;
        }
        if (aFecha(checkIn) >= aFecha(checkOut)) {
            Swal.fire({ title: "Fechas inválidas", text: "El check-out debe ser posterior al check-in.", icon: "warning", confirmButtonColor: "#f38d1e" });
            return;
        }

        // 🆕 Validación local ANTES de gastar una llamada al backend:
        // si el rango elegido choca con alguna reserva activa, avisamos
        // de una vez con el modal que ya tienes implementado.
        if (haySolapamiento(checkIn, checkOut, rangosOcupados)) {
            Swal.fire({
                title: "Fechas no disponibles",
                text: "Esta habitación ya está reservada en parte de ese rango. Elige otras fechas.",
                icon: "error",
                confirmButtonColor: "#f38d1e",
            });
            return;
        }
        const docUsuario = verificarPerfil(user);
        if (!docUsuario) return;

        const { noches, total } = calcularNochesYTotal();

        const confirmacion = await Swal.fire({
            title: "¿Enviar solicitud de reserva?",
            html: `
                <div style="text-align:left;padding:0 1rem">
                    <p><strong>Habitación:</strong> ${escapeHtml(habitacion.numeroHabitacion)}</p>
                    <p><strong>Check-in:</strong> ${aFecha(checkIn).toLocaleDateString()}</p>
                    <p><strong>Check-out:</strong> ${aFecha(checkOut).toLocaleDateString()}</p>
                    <p><strong>Noches:</strong> ${noches}</p>
                    <hr>
                    <p style="font-size:1.2rem;color:#f38d1e"><strong>Total: $${total.toLocaleString("es-CO")}</strong></p>
                </div>
            `,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, enviar solicitud",
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
                fCheckIn: aInicioDelDiaLocal(checkIn),
                fCheckOut: aInicioDelDiaLocal(checkOut),
            });
            await Swal.fire({
                // La reserva queda PENDIENTE hasta que el admin la apruebe
                title: "¡Solicitud enviada!",
                text: `Tu reserva de la habitación ${habitacion.numeroHabitacion} quedó pendiente de aprobación. Te avisaremos por correo cuando sea confirmada.`,
                icon: "success",
                confirmButtonColor: "#f38d1e",
            });
            navigate("/reservas-hoteleras/mis-reservas");
        } catch (err) {
            // 🆕 Este catch es tu red de seguridad final: si por una condición
            // de carrera (dos usuarios reservando al mismo tiempo) el backend
            // rechaza con 409, el mensaje "Esta habitación ya está reservada
            // para esas fechas..." llega aquí tal cual y se muestra en el modal.
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

    if (error || !habitacion) {
        return (
            <Container className="main-container golden-booking-layout py-5 text-center">
                <h3 className="mb-3">😕 {error || "Habitación no encontrada."}</h3>
                <Button className="btn-detail" onClick={() => navigate("/habitaciones")}>
                    <BiArrowBack /> Volver al catálogo
                </Button>
            </Container>
        );
    }

    const disponible =
        habitacion.estadoHabitacion?.toLowerCase() === "disponible";
    const { noches, total } = calcularNochesYTotal();

    // 🆕 Fecha mínima de check-out: si ya eligió check-in, además del
    // requisito "posterior al check-in", podríamos sugerir saltar directo
    // al primer día libre, pero eso ya es una mejora opcional (ver nota al final).
    return (
        <Container className="main-container golden-booking-layout py-5">
            <Button variant="link" className="btn-detail mb-4" onClick={() => navigate(-1)}>
                <BiArrowBack /> Volver al listado
            </Button>

            <Card className="hotel-card">
                <Row className="g-0">
                    <Col md={6} className="hotel-image-container">
                        <img
                            src={imagenHabitacion(habitacion)}
                            onError={usarImagenDeRespaldoHabitacion}
                            className="hotel-image"
                            alt="Habitación"
                        />
                    </Col>

                    <Col md={6} className="hotel-info-block p-5">
                        <div className="hotel-header d-flex justify-content-between align-items-start">
                            <h4>{habitacion.numeroHabitacion}</h4>
                            <span className={`status-tag-v2 ${disponible ? "disponible" : "no-disponible"}`}>
                                {disponible ? "✓ Disponible" : "✗ No disponible"}
                            </span>
                        </div>
                        <h4 className="text-muted mb-4">{datosTipo(habitacion).nombre}</h4>

                        <p className="room-description mb-4">{habitacion.descripcion || "Disfruta de una estancia inolvidable."}</p>

                        <div className="details-boxes">
                            <div className="details-box"><BiGroup /> Capacidad: {datosTipo(habitacion).capacidad ?? "—"} Pers.</div>
                            <div className="details-box"><BiCalendar /> WiFi: Incluido</div>
                        </div>

                        {/* 🆕 Aviso visual si hay fechas ocupadas, para que el usuario
                            entienda por qué le puede fallar cierto rango */}
                        {rangosOcupados.length > 0 && (
                            <p className="small text-muted mt-3 mb-0">
                                📅 Esta habitación tiene {rangosOcupados.length} reserva{rangosOcupados.length !== 1 ? "s" : ""} activa{rangosOcupados.length !== 1 ? "s" : ""}. Si eliges fechas que se crucen, te avisaremos.
                            </p>
                        )}

                        <Row className="g-2 mt-4">
                            <Col xs={6}>
                                <label className="small fw-semibold text-muted d-block mb-1">Check-in</label>
                                <div className="date-input-wrapper">
                                    <BiCalendarAlt className="calendar-icon" />
                                    <DatePicker
                                        selected={checkIn ? aFecha(checkIn) : null}
                                        onChange={(date) => setCheckIn(date ? toLocalDateString(date) : "")}
                                        dateFormat="dd/MM/yyyy"
                                        locale="es"
                                        className="form-control custom-date-input"
                                        placeholderText="dd/mm/aaaa"
                                        minDate={new Date()}
                                        portalId="datepicker-portal"
                                    />
                                </div>
                            </Col>
                            <Col xs={6}>
                                <label className="small fw-semibold text-muted d-block mb-1">Check-out</label>
                                <div className="date-input-wrapper">
                                    <BiCalendarAlt className="calendar-icon" />
                                    <DatePicker
                                        selected={checkOut ? aFecha(checkOut) : null}
                                        onChange={(date) => setCheckOut(date ? toLocalDateString(date) : "")}
                                        dateFormat="dd/MM/yyyy"
                                        locale="es"
                                        className="form-control custom-date-input"
                                        placeholderText="dd/mm/aaaa"
                                        minDate={checkIn ? aFecha(checkIn) : new Date()}
                                        portalId="datepicker-portal"
                                    />
                                </div>
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