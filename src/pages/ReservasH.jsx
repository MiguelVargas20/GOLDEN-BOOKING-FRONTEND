import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoStar, IoHeartOutline, IoHeart } from "react-icons/io5";
import { BiCalendar } from "react-icons/bi";
import Dropdown from "react-bootstrap/Dropdown";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";
import {
    listarHabitaciones,
    crearReservaHotel,
} from "../api/ReservaHotelApi";
import "../styles/reservasH.css";

/**
 * RESERVAS HOSPEDAJE
 *
 * Flujo:
 *  1. Carga habitaciones desde GET /api/habitaciones
 *  2. El usuario selecciona fechas y huéspedes por habitación
 *  3. Al hacer clic en "Ver detalle" va a /detalle/:id
 *  4. Al hacer clic en "Reservar" llama POST /api/reservas/hotel
 *
 * ReservaHotelDto que envía:
 *  { docUsuario, idHabitacion, fCheckIn, fCheckOut }
 *  El back calcula: noch, pTotal, numeroHabitacion, tHabitacion, pNoche
 */

// Imagen placeholder por defecto si la habitación no tiene imagen
const PLACEHOLDER =
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80";

export default function ReservasHospedaje() {
    const navigate = useNavigate();

    // ── Estados globales ──────────────────────────────────────
    const [habitaciones, setHabitaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ── Estado por habitación (huéspedes, fechas, favorito) ──
    // Guardamos un objeto indexado por habitacion.id
    const [config, setConfig] = useState({});

    // ── Feedback de reserva ───────────────────────────────────
    const [reservando, setReservando] = useState(null); // id de hab que se está reservando
    const [mensajeExito, setMensajeExito] = useState("");
    const [mensajeError, setMensajeError] = useState("");

    /* ── Cargar habitaciones al montar ───────────────────────── */
    useEffect(() => {
        const cargar = async () => {
            setLoading(true);
            try {
                const data = await listarHabitaciones();
                setHabitaciones(data);

                // Inicializar config para cada habitación
                const configInicial = {};
                data.forEach((h) => {
                    configInicial[h.id] = {
                        adultos: 2,
                        ninos: 0,
                        habitaciones: 1,
                        checkIn: "",
                        checkOut: "",
                        favorito: false,
                    };
                });
                setConfig(configInicial);
            } catch {
                setError("No se pudieron cargar las habitaciones. Verifica tu conexión.");
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, []);

    /* ── Helpers de config por habitación ────────────────────── */
    const getConfig = (id) =>
        config[id] || { adultos: 2, ninos: 0, habitaciones: 1, checkIn: "", checkOut: "", favorito: false };

    const setConfigHab = (id, campo, valor) => {
        setConfig((prev) => ({
            ...prev,
            [id]: { ...getConfig(id), [campo]: valor },
        }));
    };

    /* ── Calcular noches ─────────────────────────────────────── */
    const calcularNoches = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return 0;
        const diff = new Date(checkOut) - new Date(checkIn);
        return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
    };

    /* ── Reservar habitación ─────────────────────────────────── */
    const handleReservar = async (hab) => {
        const cfg = getConfig(hab.id);

        // Validaciones
        if (!cfg.checkIn || !cfg.checkOut) {
            setMensajeError("Selecciona las fechas de check-in y check-out.");
            setTimeout(() => setMensajeError(""), 3000);
            return;
        }
        if (new Date(cfg.checkIn) >= new Date(cfg.checkOut)) {
            setMensajeError("La fecha de check-out debe ser posterior al check-in.");
            setTimeout(() => setMensajeError(""), 3000);
            return;
        }

        // Obtener docUsuario del localStorage (guardado al hacer login)
        const docUsuario = localStorage.getItem("docUsuario");
        if (!docUsuario) {
            navigate("/login");
            return;
        }

        setReservando(hab.id);
        setMensajeError("");
        try {
            // Body que espera el back (ReservaHotelDto)
            const body = {
                docUsuario,
                idHabitacion: hab.id,
                fCheckIn: new Date(cfg.checkIn).toISOString(),
                fCheckOut: new Date(cfg.checkOut).toISOString(),
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

    /* ── Render ──────────────────────────────────────────────── */
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
        <div className="container-fluid main-container">

            {/* ── Mensajes globales ─────────────────────────────── */}
            {mensajeExito && (
                <div className="alert alert-success text-center mx-3 mt-3">{mensajeExito}</div>
            )}
            {mensajeError && (
                <div className="alert alert-danger text-center mx-3 mt-3">{mensajeError}</div>
            )}

            <Row>
                <Col>
                    {habitaciones.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            No hay habitaciones disponibles en este momento.
                        </div>
                    ) : (
                        habitaciones.map((hab) => {
                            const cfg = getConfig(hab.id);
                            const noches = calcularNoches(cfg.checkIn, cfg.checkOut);
                            const total = noches > 0 ? noches * (hab.precioNoche || 0) : null;
                            const disponible = hab.estadoHabitacion?.toLowerCase() === "disponible";

                            return (
                                <div key={hab.id} className="hotel-card mb-4">

                                    {/* Imagen */}
                                    <img
                                        src={hab.imagenUrl || PLACEHOLDER}
                                        alt={hab.numeroHabitacion}
                                        className="hotel-image"
                                    />

                                    {/* Info central */}
                                    <div className="hotel-info">

                                        {/* Header */}
                                        <div className="hotel-header">
                                            <h4>
                                                {hab.numeroHabitacion} ·{" "}
                                                {hab.datosTipoHabitacion?.nombreTipoHabitacion || "Habitación"}
                                            </h4>
                                            <div className="rating">
                                                <IoStar /> {hab.rating || "4.8"}
                                            </div>
                                        </div>

                                        {/* Descripción */}
                                        {hab.descripcion && (
                                            <p className="location">{hab.descripcion}</p>
                                        )}

                                        {/* Capacidad */}
                                        <p className="location" style={{ fontSize: "0.82rem", color: "#888" }}>
                                            👥 Capacidad: {hab.datosTipoHabitacion?.capacidadMaxima || "—"} personas
                                        </p>

                                        {/* Estado */}
                                        <div className="amenities">
                                            <span
                                                style={{
                                                    background: disponible ? "#e6f4ea" : "#fce8e6",
                                                    color: disponible ? "#2e7d32" : "#c62828",
                                                    borderRadius: "20px",
                                                    padding: "3px 12px",
                                                    fontSize: "0.78rem",
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {disponible ? "✓ Disponible" : "✗ No disponible"}
                                            </span>
                                            <span>Free WiFi</span>
                                            <span>Breakfast included</span>
                                        </div>

                                        {/* Selector de huéspedes */}
                                        <Dropdown className="mb-3 w-100">
                                            <Dropdown.Toggle className="dropdown-guests w-100">
                                                {cfg.adultos} Adultos · {cfg.ninos} Niños · {cfg.habitaciones} Habitación(es)
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu className="dropdown-menu-guests">
                                                <Counter
                                                    label="Adultos"
                                                    value={cfg.adultos}
                                                    setValue={(v) => setConfigHab(hab.id, "adultos", v)}
                                                />
                                                <Counter
                                                    label="Niños"
                                                    value={cfg.ninos}
                                                    setValue={(v) => setConfigHab(hab.id, "ninos", v)}
                                                />
                                                <Counter
                                                    label="Habitaciones"
                                                    value={cfg.habitaciones}
                                                    setValue={(v) => setConfigHab(hab.id, "habitaciones", v)}
                                                    min={1}
                                                />
                                            </Dropdown.Menu>
                                        </Dropdown>

                                        {/* Fechas */}
                                        <h4 className="title-dates">Selecciona tus fechas</h4>
                                        <div className="dates-container">
                                            <div className="date-box">
                                                <label>Check-in</label>
                                                <div className="input-wrapper">
                                                    <BiCalendar className="icon" />
                                                    <input
                                                        type="date"
                                                        value={cfg.checkIn}
                                                        min={new Date().toISOString().split("T")[0]}
                                                        onChange={(e) => setConfigHab(hab.id, "checkIn", e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="date-box">
                                                <label>Check-out</label>
                                                <div className="input-wrapper">
                                                    <BiCalendar className="icon" />
                                                    <input
                                                        type="date"
                                                        value={cfg.checkOut}
                                                        min={cfg.checkIn || new Date().toISOString().split("T")[0]}
                                                        onChange={(e) => setConfigHab(hab.id, "checkOut", e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Resumen de noches */}
                                        {noches > 0 && (
                                            <p style={{ fontSize: "0.85rem", color: "#888", marginTop: "8px" }}>
                                                🌙 {noches} noche{noches !== 1 ? "s" : ""} ·{" "}
                                                <strong style={{ color: "#c9a84c" }}>
                                                    Total: ${total?.toLocaleString("es-CO")}
                                                </strong>
                                            </p>
                                        )}
                                    </div>

                                    {/* Acciones derecha */}
                                    <div className="hotel-actions">
                                        {/* Favorito */}
                                        <button
                                            className="fav-btn"
                                            onClick={() => setConfigHab(hab.id, "favorito", !cfg.favorito)}
                                            style={{ background: "none", border: "none", cursor: "pointer" }}
                                        >
                                            {cfg.favorito
                                                ? <IoHeart className="fav" style={{ color: "#e53935" }} />
                                                : <IoHeartOutline className="fav" />
                                            }
                                        </button>

                                        {/* Precio */}
                                        <h3>${hab.precioNoche?.toLocaleString("es-CO") || "—"}</h3>
                                        <span>/ noche</span>

                                        {/* Ver detalle */}
                                        <button
                                            className="btn-detail"
                                            onClick={() => navigate(`/detalle/${hab.id}`)}
                                        >
                                            Ver detalle
                                        </button>

                                        {/* Reservar */}
                                        <button
                                            className="btn-reservar"
                                            onClick={() => handleReservar(hab)}
                                            disabled={!disponible || reservando === hab.id}
                                            style={{
                                                marginTop: "8px",
                                                background: disponible ? "#c9a84c" : "#ccc",
                                                cursor: disponible ? "pointer" : "not-allowed",
                                            }}
                                        >
                                            {reservando === hab.id ? (
                                                <><span className="spinner-border spinner-border-sm me-1" />Reservando...</>
                                            ) : "Reservar"}
                                        </button>
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

/* ── Subcomponente Counter ───────────────────────────────── */
function Counter({ label, value, setValue, min = 0 }) {
    return (
        <div className="counter-row">
            <span>{label}</span>
            <div>
                <button onClick={() => value > min && setValue(value - 1)}>-</button>
                <span>{value}</span>
                <button onClick={() => setValue(value + 1)}>+</button>
            </div>
        </div>
    );
}