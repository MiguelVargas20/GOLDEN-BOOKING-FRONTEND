import { useState, useEffect, useMemo } from "react"; // <--- Agregué useMemo
import { useNavigate } from "react-router-dom";
import { IoAddCircleOutline } from "react-icons/io5";
import { BiCalendarAlt, BiGroup, BiMoney } from "react-icons/bi";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";
import Form from "react-bootstrap/Form"; // <--- Agregué Form para los filtros
import { listarHabitaciones } from "../api/HabitacionApi";
import { useAuth } from "../context/AuthContext";
import { crearReservaHotel } from "../api/ReservaHotelApi";
import "../styles/reservasH.css";

const PLACEHOLDER =
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80";

export default function ReservasH() {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();

    const [habitaciones, setHabitaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [fechas, setFechas] = useState({});
    const [reservando, setReservando] = useState(null); 
    const [mensajeExito, setMensajeExito] = useState("");
    const [mensajeError, setMensajeError] = useState("");

    // --- NUEVOS ESTADOS PARA FILTROS ---
    const [filterTipo, setFilterTipo] = useState("Todos");
    const [ordenPrecio, setOrdenPrecio] = useState("normal");

    useEffect(() => {
        const cargar = async () => {
            setLoading(true);
            try {
                const data = await listarHabitaciones();
                
                let listaValida = [];
                if (Array.isArray(data)) {
                    listaValida = data;
                } else if (data && Array.isArray(data.content)) {
                    listaValida = data.content;
                } else if (data && Array.isArray(data.contenido)) {
                    listaValida = data.contenido;
                } else {
                    listaValida = []; 
                }

                setHabitaciones(listaValida);

                const fechasIniciales = {};
                listaValida.forEach((h) => {
                    fechasIniciales[h.id] = {
                        checkIn: "",
                        checkOut: "",
                    };
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

    // --- LÓGICA DE FILTRADO Y ORDENAMIENTO (OPTIMIZADA) ---
    const habitacionesFiltradas = useMemo(() => {
        let lista = [...habitaciones];
        
        if (filterTipo !== "Todos") {
            lista = lista.filter(h => h.datosTipoHabitacion?.nombreTipoHabitacion === filterTipo);
        }
        
        if (ordenPrecio === "asc") lista.sort((a, b) => a.precioNoche - b.precioNoche);
        else if (ordenPrecio === "desc") lista.sort((a, b) => b.precioNoche - a.precioNoche);
        
        return lista;
    }, [habitaciones, filterTipo, ordenPrecio]);

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

    const handleReservar = async (hab) => {
        const habFechas = getFechasHab(hab.id);

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

            {mensajeExito && (
                <div className="alert alert-success text-center mx-3 mt-3">{mensajeExito}</div>
            )}
            {mensajeError && (
                <div className="alert alert-danger text-center mx-3 mt-3">{mensajeError}</div>
            )}

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
                    <div />
                )}
            </div>

            {/* --- PANEL DE FILTROS NUEVO --- */}
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
                        // Mapeamos las habitaciones filtradas
                        habitacionesFiltradas.map((hab) => {
                            const habFechas = getFechasHab(hab.id);
                            const disponible = hab.estadoHabitacion?.toLowerCase() === "disponible";

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
                                                {hab.datosTipoHabitacion?.nombreTipoHabitacion }
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
                                            <span className={`status-tag ${disponible ? 'disponible' : 'no-disponible'}`}>
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
                                        </div>
                                    </div>

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