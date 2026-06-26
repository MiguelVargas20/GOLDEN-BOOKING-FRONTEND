import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoAddCircleOutline } from "react-icons/io5";
import { BiCalendarAlt, BiGroup, BiMoney } from "react-icons/bi"; // Nuevos iconos
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";
import {
    listarHabitaciones,
    crearReservaHotel,
} from "../api/ReservaHotelApi";
import "../styles/reservasH.css"; // Usa el nuevo CSS

// Imagen placeholder
const PLACEHOLDER =
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80";

export default function ReservasHospedaje() {
    const navigate = useNavigate();

    // ── Estados globales
    const [habitaciones, setHabitaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ── Estado por habitación (fechas) - Solo fechas, sin contador
    const [fechas, setFechas] = useState({});

    // ── Feedback de reserva
    const [reservando, setReservando] = useState(null); 
    const [mensajeExito, setMensajeExito] = useState("");
    const [mensajeError, setMensajeError] = useState("");

    /* ── Cargar habitaciones al montar */
    useEffect(() => {
        const cargar = async () => {
            setLoading(true);
            try {
                const data = await listarHabitaciones();
                setHabitaciones(data || []);

                // Inicializar fechas para cada habitación
                const fechasIniciales = {};
                if (data && Array.isArray(data)) {
                    data.forEach((h) => {
                        fechasIniciales[h.id] = {
                            checkIn: "", // YYYY-MM-DD
                            checkOut: "", // YYYY-MM-DD
                        };
                    });
                }
                setFechas(fechasIniciales);
            } catch {
                setError("No se pudieron cargar las habitaciones. Verifica tu conexión.");
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, []);

    /* ── Helpers de fechas por habitación */
    const getFechasHab = (id) =>
        fechas[id] || { checkIn: "", checkOut: "" };

    const setFechaHab = (id, campo, valor) => {
        setFechas((prev) => {
            const currentHabFechas = prev[id] || {};
            const newFechas = { ...prev };
            newFechas[id] = { ...currentHabFechas, [campo]: valor };
            return newFechas;
        });
    };

    /* ── Reservar habitación */
    const handleReservar = async (hab) => {
        const habFechas = getFechasHab(hab.id);

        // Validaciones
        if (!habFechas.checkIn || !habFechas.checkOut) {
            setMensajeError("Selecciona las fechas de check-in y check-out.");
            setTimeout(() => setMensajeError(""), 3000);
            return;
        }
        if (new Date(habFechas.checkIn) >= new Date(habFechas.checkOut)) {
            setMensajeError("La fecha de check-out debe ser posterior al check-in.");
            setTimeout(() => setMensajeError(""), 3000);
            return;
        }

        const docUsuario = localStorage.getItem("docUsuario");
        if (!docUsuario) {
            navigate("/login");
            return;
        }

        setReservando(hab.id);
        setMensajeError("");
        try {
            const body = {
                docUsuario,
                idHabitacion: hab.id,
                fCheckIn: new Date(habFechas.checkIn).toISOString(),
                fCheckOut: new Date(habFechas.checkOut).toISOString(),
            };
            await crearReservaHotel(body);
            setMensajeExito(`¡Reserva confirmada para ${hab.numeroHabitacion}!`);
            setTimeout(() => setMensajeExito(""), 4000);
        } catch (err) {
            setMensajeError(err.message || "Error al crear la reserva.");
            setTimeout(() => setMensajeError(""), 4000);
        } finally {
            setReservando(null);
        }
    };

    /* ── Render */
    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
            <Spinner animation="border" style={{ color: "#c9a84c" }} />
        </div>
    );

    if (error) return (
        <div className="container py-5 text-center">
            <p className="text-danger">{error}</p>
        </div>
    );

    return (
        <div className="container-fluid main-container golden-booking-layout">

            {mensajeExito && (
                <div className="alert alert-success text-center mx-3 mt-3">{mensajeExito}</div>
            )}
            {mensajeError && (
                <div className="alert alert-danger text-center mx-3 mt-3">{mensajeError}</div>
            )}

            <Row className="mb-4 mx-1">
                <Col className="d-flex justify-content-start">
                    <button 
                        className="btn-create-room"
                        onClick={() => navigate("/crear-habitacion")}
                    >
                        <IoAddCircleOutline className="me-2 fs-5" />
                        Crear Habitación
                    </button>
                </Col>
            </Row>

            <Row>
                <Col>
                    {habitaciones.length === 0 ? (
                        <div className="text-center py-5 text-muted empty-banner">
                            No hay habitaciones disponibles en este momento.
                        </div>
                    ) : (
                        habitaciones.map((hab) => {
                            const habFechas = getFechasHab(hab.id);
                            const disponible = hab.estadoHabitacion?.toLowerCase() === "disponible";

                            return (
                                <div key={hab.id} className="hotel-card mb-4">

                                    {/* 1. Imagen */}
                                    <div className="hotel-image-container">
                                        <img
                                            src={hab.imagenUrl || PLACEHOLDER}
                                            alt={hab.numeroHabitacion}
                                            className="hotel-image"
                                        />
                                    </div>

                                    {/* 2. Información centralizada (Mejorada) */}
                                    <div className="hotel-info-block">

                                        <div className="hotel-header">
                                            {/* Título Estético Serif */}
                                            <h4>
                                                {hab.numeroHabitacion} ·{" "}
                                                {hab.datosTipoHabitacion?.nombreTipoHabitacion }
                                            </h4>
                                        </div>

                                        {hab.descripcion && (
                                            <p className="room-description">{hab.descripcion}</p>
                                        )}

                                        {/* Bloque de Capacidad y Precio Base con Iconos */}
                                        <div className="details-boxes mb-3">
                                            <div className="details-box">
                                                <BiGroup /> Max Capacidad: {hab.datosTipoHabitacion?.capacidadMaxima || "2"} Personas
                                            </div>
                                            <div className="details-box">
                                                <BiMoney /> Precio Base: ${hab.precioNoche?.toLocaleString("es-CO")} / noche
                                            </div>
                                        </div>

                                        <div className="amenities-tags mb-3">
                                            <span className={`status-tag ${disponible ? 'disponible' : 'no-disponible'}`}>
                                                {disponible ? "✓ Disponible" : "✗ No disponible"}
                                            </span>
                                            <span className="amenity-tag">Free WiFi</span>
                                            <span className="amenity-tag">Breakfast included</span>
                                        </div>

                                        {/* ── SELECTOR DE FECHAS (CALENDARIO CÓMODO) INTEGRADO ── */}
                                        <div className="booking-dates">
                                            <div className="date-picker-row">
                                                <div className="date-input-group">
                                                    <label>Check-in (Desde)</label>
                                                    <div className="date-input-wrapper">
                                                        <BiCalendarAlt className="calendar-icon" />
                                                        <input 
                                                            type="date" 
                                                            value={habFechas.checkIn} 
                                                            min={new Date().toISOString().split("T")[0]} 
                                                            onChange={(e) => setFechaHab(hab.id, "checkIn", e.target.value)} 
                                                        />
                                                    </div>
                                                </div>
                                                <div className="date-input-group">
                                                    <label>Check-out (Hasta)</label>
                                                    <div className="date-input-wrapper">
                                                        <BiCalendarAlt className="calendar-icon" />
                                                        <input 
                                                            type="date" 
                                                            value={habFechas.checkOut} 
                                                            min={habFechas.checkIn || new Date().toISOString().split("T")[0]} 
                                                            onChange={(e) => setFechaHab(hab.id, "checkOut", e.target.value)} 
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. Precio y Acciones Derecha (CENTRADO VERTICAL Y HORIZONTAL) */}
                                    <div className="hotel-actions-block">
                                        <div className="price-block">
                                            <p className="base-price">${hab.precioNoche?.toLocaleString("es-CO") || "—"}</p>
                                            <span className="price-label">/ noche</span>
                                        </div>

                                        <div className="action-buttons">
                                            <button className="btn-detail" onClick={() => navigate(`/detalle/${hab.id}`)}>
                                                Ver detalle
                                            </button>
                                            <button 
                                                className="btn-reservar" 
                                                onClick={() => handleReservar(hab)} 
                                                disabled={!disponible || reservando === hab.id}
                                            >
                                                {reservando === hab.id ? (
                                                    <Spinner animation="border" size="sm" />
                                                ) : "Reservar"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </Col>
            </Row>
        </div>
    );
}