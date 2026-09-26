import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { IoAddCircleOutline } from "react-icons/io5";
import { BiCalendarAlt, BiGroup, BiMoney } from "react-icons/bi";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import { listarTodasLasHabitaciones } from "../api/HabitacionApi";
import { crearReservaHotel, obtenerFechasOcupadas } from "../../reservasHoteleras/api/ReservaHotelApi";
import { haySolapamiento, toLocalDateString } from "../../reservasHoteleras/utils/fechasHotel";
import { aFecha, aInicioDelDiaLocal, nochesEntre } from "../../../shared/utils/fechas";
import { useAuth } from "../../../shared/context/AuthContext";
import { datosTipo } from "../utils/tipoHabitacion";
import { imagenHabitacion, usarImagenDeRespaldoHabitacion } from "../utils/imagenHabitacion";
import { useRequierePerfilCompleto } from "../../../shared/hooks/useRequirePerfilCompleto";
import LoadingSpinner from "../../../shared/components/LoadingSpinner";
import Swal from "sweetalert2";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../../shared/styles/DatePickerCompartido.css";
import { es } from "date-fns/locale";
import "../styles/CatalogoHabitaciones.css";
import "../../../shared/styles/BotonesCompartidos.css";
import { escapeHtml } from "../../../shared/utils/escapeHtml";

registerLocale("es", es);

export default function CatalogoHabitaciones() {
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();
    const { verificarPerfil } = useRequierePerfilCompleto();

    const [habitaciones, setHabitaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [fechas, setFechas] = useState({});
    const [reservando, setReservando] = useState(null);

    // 🆕 mapa { idHabitacion: [{checkIn, checkOut}, ...] } con las reservas activas de cada habitación
    const [rangosOcupadosPorHabitacion, setRangosOcupadosPorHabitacion] = useState({});

    const [filterTipo, setFilterTipo] = useState("Todos");
    const [ordenPrecio, setOrdenPrecio] = useState("normal");

    useEffect(() => {
        const cargar = async () => {
            setLoading(true);
            try {
                // Trae TODAS las habitaciones (antes solo llegaban las primeras 10)
                const listaValida = await listarTodasLasHabitaciones();

                setHabitaciones(listaValida);

                const fechasIniciales = {};
                listaValida.forEach((h) => {
                    fechasIniciales[h.id] = { checkIn: "", checkOut: "" };
                });
                setFechas(fechasIniciales);

                // 🆕 Traemos las fechas ocupadas de TODAS las habitaciones en paralelo.
                // Si una falla individualmente, no tumbamos la carga completa:
                // esa habitación simplemente queda con rangosOcupados = [] y confiamos
                // en el backend (409) como red de seguridad para ella.
                const entradas = await Promise.all(
                    listaValida.map(async (h) => {
                        try {
                            const rangos = await obtenerFechasOcupadas(h.id);
                            return [h.id, rangos];
                        } catch (errFechas) {
                            console.error(`No se pudieron cargar fechas ocupadas de ${h.id}:`, errFechas);
                            return [h.id, []];
                        }
                    })
                );
                setRangosOcupadosPorHabitacion(Object.fromEntries(entradas));

            } catch (err) {
                console.error("Error en la petición:", err);
                setError("No se pudieron cargar las habitaciones. Verifica tu conexión.");
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, []);

    const tiposDisponibles = useMemo(
        () => [...new Set(habitaciones.map((h) => datosTipo(h).nombre).filter(Boolean))].sort(),
        [habitaciones],
    );

    const habitacionesFiltradas = useMemo(() => {
        let lista = [...habitaciones];

        if (filterTipo !== "Todos") {
            lista = lista.filter(
                (h) => datosTipo(h).nombre === filterTipo
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

        const noches = nochesEntre(checkIn, checkOut);

        if (noches <= 0) return { noches: 0, total: 0 };
        return { noches, total: noches * (hab.precioNoche || 0) };
    };

    const handleReservar = async (hab) => {
        const habFechas = getFechasHab(hab.id);

        if (!habFechas.checkIn || !habFechas.checkOut) {
            Swal.fire({ title: "Fechas requeridas", text: "Selecciona check-in y check-out.", icon: "warning", confirmButtonColor: "#f38d1e" });
            return;
        }
        if (aFecha(habFechas.checkIn) >= aFecha(habFechas.checkOut)) {
            Swal.fire({ title: "Fechas inválidas", text: "El check-out debe ser posterior al check-in.", icon: "warning", confirmButtonColor: "#f38d1e" });
            return;
        }

        // 🆕 Validación de solapamiento ANTES de gastar una llamada al backend.
        const ocupadas = rangosOcupadosPorHabitacion[hab.id] || [];
        if (haySolapamiento(habFechas.checkIn, habFechas.checkOut, ocupadas)) {
            Swal.fire({
                title: "Fechas no disponibles",
                text: `La habitación ${hab.numeroHabitacion} ya está reservada en parte de ese rango. Elige otras fechas.`,
                icon: "error",
                confirmButtonColor: "#f38d1e",
            });
            return;
        }

        const docUsuario = verificarPerfil(user);
        if (!docUsuario) return;

        const { noches, total } = calcularNochesYTotal(hab);

        const confirmacion = await Swal.fire({
            title: "¿Enviar solicitud de reserva?",
            html: `
                <div style="text-align:left;padding:0 1rem; font-family: 'Poppins', sans-serif;">
                    <p><strong>Habitación:</strong> ${escapeHtml(hab.numeroHabitacion)}</p>
                    <p><strong>Check-in:</strong> ${aFecha(habFechas.checkIn).toLocaleDateString()}</p>
                    <p><strong>Check-out:</strong> ${aFecha(habFechas.checkOut).toLocaleDateString()}</p>
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

        setReservando(hab.id);
        try {
            const body = {
                docUsuario,
                idHabitacion: hab.id,
                fCheckIn: aInicioDelDiaLocal(habFechas.checkIn),
                fCheckOut: aInicioDelDiaLocal(habFechas.checkOut),
            };
            await crearReservaHotel(body);
            await Swal.fire({
                // La reserva queda PENDIENTE hasta que el admin la apruebe
                title: "¡Solicitud enviada!",
                text: `Tu reserva de la habitación ${hab.numeroHabitacion} quedó pendiente de aprobación. Te avisaremos por correo cuando sea confirmada.`,
                icon: "success",
                confirmButtonColor: "#f38d1e",
            });

            // 🆕 Refrescamos las fechas ocupadas de ESTA habitación, para que
            // si el mismo admin/usuario abre otra tarjeta de la misma habitación
            // sin recargar la página, ya vea el nuevo rango bloqueado.
            try {
                const actualizadas = await obtenerFechasOcupadas(hab.id);
                setRangosOcupadosPorHabitacion((prev) => ({ ...prev, [hab.id]: actualizadas }));
            } catch {
                // no crítico: en el peor caso, el usuario recarga y las ve igual
            }

            navigate("/reservas-hoteleras/mis-reservas");
        } catch (err) {
            // Red de seguridad: si hubo una condición de carrera (dos personas
            // reservando la misma habitación/fecha casi al mismo tiempo), el
            // backend responde 409 y el mensaje llega aquí tal cual.
            Swal.fire({ title: "No se pudo reservar", text: err.message || "Error al crear la reserva.", icon: "error", confirmButtonColor: "#f38d1e" });
        } finally {
            setReservando(null);
        }
    };

    if (loading) return <LoadingSpinner />;

    if (error) return (
        <div className="container py-5 text-center">
            <p className="text-danger">{error}</p>
        </div>
    );

    return (
        <div className="container-fluid main-container golden-booking-layout py-3">

            <div className="conexion-status-container mx-3 text-end">
                <span className="conexion-badge en-vivo">🟢 En vivo</span>
            </div>

            <div className="botones-reservas-v2 mt-2 mb-4 mx-3">
                <div className="acciones-izquierda">
                    {isAdmin() && (
                        <>
                            <button
                                className="btn-gb btn-gb-primary btn-gb-sm"
                                onClick={() => navigate("/habitaciones/crear")}
                            >
                                <IoAddCircleOutline /> Crear
                            </button>
                            <button
                                className="btn-reserva-sm gestionar"
                                onClick={() => navigate("/habitaciones/gestionar")}
                            >
                                ⚙️ Gestionar
                            </button>
                        </>
                    )}
                </div>

                <h1 className="titulo-reservas-v2">
                    NUESTRAS <span>HABITACIONES</span>
                </h1>

                <div className="acciones-derecha">
                    <button
                        className="btn-reserva-sm mis"
                        onClick={() => navigate("/reservas-hoteleras/mis-reservas")}
                    >
                        📋 Mis Reservas
                    </button>
                </div>
            </div>

            <div className="mx-3 mb-4 p-3 bg-white rounded shadow-sm border border-light-subtle">
                <Row className="g-3 align-items-center">
                    <Col sm={12} md={6}>
                        <Form.Label className="fw-semibold text-muted small mb-1">Filtrar por tipo:</Form.Label>
                        <Form.Select className="filter-select-custom" onChange={(e) => setFilterTipo(e.target.value)}>
                            <option value="Todos">Todos los tipos</option>
                            {/* Los tipos que existen de verdad (antes eran 3 nombres fijos) */}
                            {tiposDisponibles.map((t) => <option key={t} value={t}>{t}</option>)}
                        </Form.Select>
                    </Col>
                    <Col sm={12} md={6}>
                        <Form.Label className="fw-semibold text-muted small mb-1">Ordenar por precio:</Form.Label>
                        <Form.Select className="filter-select-custom" onChange={(e) => setOrdenPrecio(e.target.value)}>
                            <option value="normal">Sin orden</option>
                            <option value="asc">Menor a mayor</option>
                            <option value="desc">Mayor a menor</option>
                        </Form.Select>
                    </Col>
                </Row>
            </div>

            <Row className="mx-1">
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
                        const ocupadas = rangosOcupadosPorHabitacion[hab.id] || [];

                        return (
                            <Col xs={12} lg={6} key={hab.id} className="mb-4">
                                <div className="hotel-card-v2">

                                    <div className="hotel-image-container-v2">
                                        <img
                                            src={imagenHabitacion(hab)}
                                            onError={usarImagenDeRespaldoHabitacion}
                                            alt={hab.numeroHabitacion}
                                            className="hotel-image-v2"
                                        />
                                    </div>

                                    <div className="hotel-body-v2">
                                        <div className="hotel-header-v2">
                                            <h5>
                                                {hab.numeroHabitacion} ·{" "}
                                                {datosTipo(hab).nombre || "Habitación"}
                                            </h5>
                                            <span className={`status-tag-v2 ${disponible ? "disponible" : "no-disponible"}`}>
                                                {disponible ? "✓ Disponible" : "✗ Mantenimiento"}
                                            </span>
                                        </div>

                                        <div className="details-row-v2">
                                            <span><BiGroup /> {datosTipo(hab).capacidad ?? "—"} pers.</span>
                                            <span><BiMoney /> ${hab.precioNoche?.toLocaleString("es-CO")}/noche</span>
                                        </div>

                                        {/* 🆕 Aviso si esta habitación tiene reservas activas */}
                                        {ocupadas.length > 0 && (
                                            <p className="small text-muted mb-0">
                                                📅 {ocupadas.length} reserva{ocupadas.length !== 1 ? "s" : ""} activa{ocupadas.length !== 1 ? "s" : ""} — evita cruzar esas fechas.
                                            </p>
                                        )}

                                        <div className="date-picker-row-v2">
                                            <div className="date-input-group-v2">
                                                <label>Check-in</label>
                                                <div className="date-input-wrapper">
                                                    <BiCalendarAlt className="calendar-icon" />
                                                    <DatePicker
                                                        selected={habFechas.checkIn ? aFecha(habFechas.checkIn) : null}
                                                        onChange={(date) => setFechaHab(hab.id, "checkIn", date ? toLocalDateString(date) : "")}
                                                        dateFormat="dd/MM/yyyy"
                                                        locale="es"
                                                        className="form-control custom-date-input"
                                                        placeholderText="dd/mm/aaaa"
                                                        minDate={new Date()}
                                                        portalId="datepicker-portal"
                                                    />
                                                </div>
                                            </div>
                                            <div className="date-input-group-v2">
                                                <label>Check-out</label>
                                                <div className="date-input-wrapper">
                                                    <BiCalendarAlt className="calendar-icon" />
                                                    <DatePicker
                                                        selected={habFechas.checkOut ? aFecha(habFechas.checkOut) : null}
                                                        onChange={(date) => setFechaHab(hab.id, "checkOut", date ? toLocalDateString(date) : "")}
                                                        dateFormat="dd/MM/yyyy"
                                                        locale="es"
                                                        className="form-control custom-date-input"
                                                        placeholderText="dd/mm/aaaa"
                                                        minDate={habFechas.checkIn ? aFecha(habFechas.checkIn) : new Date()}
                                                        portalId="datepicker-portal"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {noches > 0 && (
                                            <div className="resumen-total-v2">
                                                {noches} noche{noches !== 1 ? "s" : ""} = ${total.toLocaleString("es-CO")}
                                            </div>
                                        )}

                                        <div className="hotel-footer-v2">
                                            <span className="precio-v2">
                                                ${noches > 0 ? total.toLocaleString("es-CO") : (hab.precioNoche?.toLocaleString("es-CO") || "—")}
                                                <small>{noches > 0 ? ` (${noches}n)` : " /noche"}</small>
                                            </span>
                                            <div className="botones-v2">
                                                <button className="btn-gb btn-gb-secondary btn-gb-sm" onClick={() => navigate(`/habitaciones/${hab.id}`)}>
                                                    Detalle
                                                </button>
                                                <button
                                                    className="btn-gb btn-gb-primary btn-gb-sm"
                                                    onClick={() => handleReservar(hab)}
                                                    disabled={!disponible || reservando === hab.id}
                                                >
                                                    {reservando === hab.id ? "Reservando..." : "Reservar"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        );
                    })
                )}
            </Row>
        </div>
    );
}