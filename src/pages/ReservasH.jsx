import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { IoAddCircleOutline } from "react-icons/io5";
import { BiCalendarAlt, BiGroup, BiMoney } from "react-icons/bi";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";
import Form from "react-bootstrap/Form";
import { listarHabitaciones } from "../api/HabitacionApi";
import { crearReservaHotel } from "../api/ReservaHotelApi";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";
import "../styles/reservasH.css";

const PLACEHOLDER =
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80";

export default function ReservasH() {
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();

    const [habitaciones, setHabitaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [fechas, setFechas] = useState({});
    const [reservando, setReservando] = useState(null);

    const [filterTipo, setFilterTipo] = useState("Todos");
    const [ordenPrecio, setOrdenPrecio] = useState("normal");

    useEffect(() => {
        const cargar = async () => {
            setLoading(true);
            try {
                const data = await listarHabitaciones();

                let listaValida = [];
                if (Array.isArray(data)) listaValida = data;
                else if (data && Array.isArray(data.content)) listaValida = data.content;
                else if (data && Array.isArray(data.contenido)) listaValida = data.contenido;

                setHabitaciones(listaValida);

                const fechasIniciales = {};
                listaValida.forEach((h) => {
                    fechasIniciales[h.id] = { checkIn: "", checkOut: "" };
                });
                setFechas(fechasIniciales);

            } catch (err) {
                console.error("Error en la petición:", err);
                setError("No se pudieron cargar las habitaciones. Verifica tu conexión.");
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, []);

    const habitacionesFiltradas = useMemo(() => {
        let lista = [...habitaciones];

        if (filterTipo !== "Todos") {
            lista = lista.filter(
                (h) => h.datosTipoHabitacion?.nombreTipoHabitacion === filterTipo
            );
        }

        if (ordenPrecio === "asc") lista.sort((a, b) => a.precioNoche - b.precioNoche);
        else if (ordenPrecio === "desc") lista.sort((a, b) => b.precioNoche - a.precioNoche);

        return lista;
    }, [habitaciones, filterTipo, ordenPrecio]);

    const getFechasHab = (id) => fechas[id] || { checkIn: "", checkOut: "" };

    const setFechaHab = (id, campo, valor) => {
        setFechas((prev) => {
            const currentHabFechas = prev[id] || {};
            return { ...prev, [id]: { ...currentHabFechas, [campo]: valor } };
        });
    };

    const calcularNochesYTotal = (hab) => {
        const { checkIn, checkOut } = getFechasHab(hab.id);
        if (!checkIn || !checkOut) return { noches: 0, total: 0 };

        const inicio = new Date(checkIn);
        const fin = new Date(checkOut);
        const noches = Math.round((fin - inicio) / (1000 * 60 * 60 * 24));

        if (noches <= 0) return { noches: 0, total: 0 };
        return { noches, total: noches * (hab.precioNoche || 0) };
    };

    const handleReservar = async (hab) => {
        const habFechas = getFechasHab(hab.id);

        if (!habFechas.checkIn || !habFechas.checkOut) {
            Swal.fire({ title: "Fechas requeridas", text: "Selecciona check-in y check-out.", icon: "warning", confirmButtonColor: "#f38d1e" });
            return;
        }
        if (new Date(habFechas.checkIn) >= new Date(habFechas.checkOut)) {
            Swal.fire({ title: "Fechas inválidas", text: "El check-out debe ser posterior al check-in.", icon: "warning", confirmButtonColor: "#f38d1e" });
            return;
        }

        const docUsuario = user?.numeroDocumento;
        if (!docUsuario) {
            Swal.fire({ title: "Perfil incompleto", text: "No se encontró tu número de documento. Actualiza tu perfil antes de reservar.", icon: "error", confirmButtonColor: "#f38d1e" });
            return;
        }

        const { noches, total } = calcularNochesYTotal(hab);

        const confirmacion = await Swal.fire({
            title: "¿Confirmar reserva?",
            html: `
                <div style="text-align:left;padding:0 1rem">
                    <p><strong>Habitación:</strong> ${hab.numeroHabitacion}</p>
                    <p><strong>Check-in:</strong> ${new Date(habFechas.checkIn).toLocaleDateString()}</p>
                    <p><strong>Check-out:</strong> ${new Date(habFechas.checkOut).toLocaleDateString()}</p>
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

        setReservando(hab.id);
        try {
            const body = {
                docUsuario,
                idHabitacion: hab.id,
                fCheckIn: new Date(habFechas.checkIn).toISOString(),
                fCheckOut: new Date(habFechas.checkOut).toISOString(),
            };
            await crearReservaHotel(body);
            await Swal.fire({
                title: "¡Reserva confirmada!",
                text: `Tu reserva para la habitación ${hab.numeroHabitacion} fue creada exitosamente.`,
                icon: "success",
                timer: 2500,
                showConfirmButton: false,
            });
            navigate("/mis-reservas-hotel");
        } catch (err) {
            Swal.fire({ title: "No se pudo reservar", text: err.message || "Error al crear la reserva.", icon: "error", confirmButtonColor: "#f38d1e" });
        } finally {
            setReservando(null);
        }
    };

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
        <div className="reservas-container container-fluid main-container golden-booking-layout">

            <div className="botones-reservas mt-4 mb-5 mx-3">
                {isAdmin() ? (
                    <button
                        className="btn-reserva gestionar d-flex align-items-center justify-content-center"
                        onClick={() => navigate("/crear-habitacion")}
                    >
                        <IoAddCircleOutline className="me-2 fs-5" /> Crear Habitación
                    </button>
                ) : (
                    <div />
                )}

                <h1 className="titulo-reservas">
                    RESERVAS <span>HOTELERAS</span>
                </h1>

                {isAdmin() ? (
                    <button
                        className="btn-reserva mis d-flex align-items-center justify-content-center"
                        onClick={() => navigate("/gestionar-habitaciones")}
                    >
                        ⚙️ Gestionar Habitaciones
                    </button>
                ) : (
                    <button
                        className="btn-reserva mis d-flex align-items-center justify-content-center"
                        onClick={() => navigate("/mis-reservas-hotel")}
                    >
                        📋 Mis Reservas
                    </button>
                )}
            </div>

            {isAdmin() && (
                <div className="d-flex justify-content-end mx-3 mb-3">
                    <button
                        className="btn-reserva mis d-flex align-items-center justify-content-center"
                        onClick={() => navigate("/mis-reservas-hotel")}
                    >
                        📋 Mis Reservas
                    </button>
                </div>
            )}

            <div className="mx-3 mb-4 p-3 bg-light rounded shadow-sm border">
                <Row className="align-items-center">
                    <Col md={6}>
                        <Form.Label className="fw-bold">Filtrar por tipo:</Form.Label>
                        <Form.Select onChange={(e) => setFilterTipo(e.target.value)}>
                            <option value="Todos">Todos los tipos</option>
                            <option value="Simple">Simple</option>
                            <option value="Familiar">Familiar</option>
                            <option value="Suite">Suite</option>
                        </Form.Select>
                    </Col>
                    <Col md={6}>
                        <Form.Label className="fw-bold">Ordenar por precio:</Form.Label>
                        <Form.Select onChange={(e) => setOrdenPrecio(e.target.value)}>
                            <option value="normal">Sin orden</option>
                            <option value="asc">Menor a mayor</option>
                            <option value="desc">Mayor a menor</option>
                        </Form.Select>
                    </Col>
                </Row>
            </div>

            <Row>
                <Col>
                    {habitacionesFiltradas.length === 0 ? (
                        <div className="text-center py-5 text-muted empty-banner">
                            No se encontraron habitaciones con esos criterios.
                        </div>
                    ) : (
                        habitacionesFiltradas.map((hab) => {
                            const habFechas = getFechasHab(hab.id);
                            const disponible =
                                hab.estadoHabitacion?.toLowerCase() === "disponible" ||
                                hab.estado?.toLowerCase() === "disponible";
                            const { noches, total } = calcularNochesYTotal(hab);

                            return (
                                <div key={hab.id} className="hotel-card mb-4 mx-3">

                                    <div className="hotel-image-container">
                                        <img
                                            src={hab.imagenUrl || PLACEHOLDER}
                                            alt={hab.numeroHabitacion}
                                            className="hotel-image"
                                        />
                                    </div>

                                    <div className="hotel-info-block">
                                        <div className="hotel-header">
                                            <h4>
                                                {hab.numeroHabitacion} ·{" "}
                                                {hab.datosTipoHabitacion?.nombreTipoHabitacion}
                                            </h4>
                                        </div>

                                        {hab.descripcion && (
                                            <p className="room-description">{hab.descripcion}</p>
                                        )}

                                        <div className="details-boxes mb-3">
                                            <div className="details-box">
                                                <BiGroup /> Max Capacidad: {hab.datosTipoHabitacion?.capacidadMaxima || "2"} Personas
                                            </div>
                                            <div className="details-box">
                                                <BiMoney /> Precio Base: ${hab.precioNoche?.toLocaleString("es-CO")} / noche
                                            </div>
                                        </div>

                                        <div className="amenities-tags mb-3">
                                            <span className={`status-tag ${disponible ? "disponible" : "no-disponible"}`}>
                                                {disponible ? "✓ Disponible" : "✗ No disponible"}
                                            </span>
                                            <span className="amenity-tag">Free WiFi</span>
                                            <span className="amenity-tag">Breakfast included</span>
                                        </div>

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

                                            {noches > 0 && (
                                                <div
                                                    style={{
                                                        marginTop: "12px",
                                                        padding: "10px 14px",
                                                        background: "#fff3e0",
                                                        borderRadius: "8px",
                                                        fontSize: "0.85rem",
                                                        color: "#5a3d00",
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {noches} noche{noches !== 1 ? "s" : ""} × ${hab.precioNoche?.toLocaleString("es-CO")} = ${total.toLocaleString("es-CO")}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="hotel-actions-block">
                                        <div className="price-block">
                                            <p className="base-price">
                                                ${noches > 0 ? total.toLocaleString("es-CO") : (hab.precioNoche?.toLocaleString("es-CO") || "—")}
                                            </p>
                                            <span className="price-label">
                                                {noches > 0 ? `total (${noches} noches)` : "/ noche"}
                                            </span>
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
                                                ) : (
                                                    "Reservar"
                                                )}
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