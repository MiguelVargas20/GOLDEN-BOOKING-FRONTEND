import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner, Row, Col } from "react-bootstrap";
import { BsArrowLeft, BsCashCoin, BsPeople, BsCalendarCheck, BsClock } from "react-icons/bs";
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
import "../../../shared/styles/PanelAdmin.css";
import "../../../shared/styles/BotonesCompartidos.css";
import "../styles/DetalleHabitacion.css";
import { useRequierePerfilCompleto } from "../../../shared/hooks/useRequirePerfilCompleto";
import { escapeHtml } from "../../../shared/utils/escapeHtml";
import { fecha, pesos } from "../../../shared/utils/formato";

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
            html: `<div class="gb-swal-detalle">
                    <div><span>Habitación</span><strong>${escapeHtml(habitacion.numeroHabitacion)}</strong></div>
                    <div><span>Check-in</span><strong>${fecha(checkIn)} · 3:00 p. m.</strong></div>
                    <div><span>Check-out</span><strong>${fecha(checkOut)} · 12:00 m.</strong></div>
                    <div><span>Noches</span><strong>${noches}</strong></div>
                    <div><span>Total</span><strong>${pesos(total)}</strong></div>
                </div>
                <p class="gb-swal-nota">Quedará pendiente hasta que la administración la apruebe.</p>`,
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
        <div className="gb-panel text-center py-5"><Spinner style={{ color: "var(--gb-primary)" }} /></div>
    );

    if (error || !habitacion) {
        return (
            <div className="gb-panel">
                <div className="gb-vacio">
                    <p>{error || "Habitación no encontrada."}</p>
                    <button type="button" className="btn-gb btn-gb-neutral btn-gb-sm" onClick={() => navigate("/habitaciones")}>
                        <BsArrowLeft /> Volver al catálogo
                    </button>
                </div>
            </div>
        );
    }

    const disponible = habitacion.estadoHabitacion === "DISPONIBLE";
    const tipo = datosTipo(habitacion);
    const { noches, total } = calcularNochesYTotal();

    return (
        <div className="gb-panel">
            <div className="gb-panel-header">
                <div>
                    <h1 className="gb-panel-titulo">Habitación <span>{habitacion.numeroHabitacion}</span></h1>
                    <p className="gb-panel-subtitulo">{tipo.nombre || "Habitación"}{tipo.descripcion ? ` · ${tipo.descripcion}` : ""}</p>
                </div>
                <div className="gb-panel-acciones">
                    <button type="button" className="btn-gb btn-gb-neutral btn-gb-sm" onClick={() => navigate("/habitaciones")}>
                        <BsArrowLeft /> Ver todas
                    </button>
                </div>
            </div>

            <Row className="g-4">
                <Col lg={7}>
                    <div className="dh-imagen">
                        <img src={imagenHabitacion(habitacion)} onError={usarImagenDeRespaldoHabitacion} alt={`Habitación ${habitacion.numeroHabitacion}`} />
                        <span className={`ge-estado ${disponible ? "ge-estado-activo" : "ge-estado-mantenimiento"}`}>
                            {disponible ? "Disponible" : habitacion.estadoHabitacion === "OCUPADA" ? "Ocupada" : "Mantenimiento"}
                        </span>
                    </div>
                    {habitacion.descripcion && (
                        <div className="gb-tarjeta mt-4">
                            <h2 className="gb-seccion-titulo">Descripción</h2>
                            <p className="m-0">{habitacion.descripcion}</p>
                        </div>
                    )}
                </Col>

                <Col lg={5}>
                    <div className="gb-tarjeta gb-form">
                        <h2 className="gb-seccion-titulo">Reservar</h2>
                        <ul className="ge-datos">
                            <li><BsCashCoin /> {pesos(habitacion.precioNoche)} por noche</li>
                            <li><BsPeople /> Hasta {tipo.capacidad ?? "—"} personas</li>
                            <li><BsClock /> Check-in 3:00 p. m. · Check-out 12:00 m.</li>
                            {rangosOcupados.length > 0 && (
                                <li><BsCalendarCheck /> Tiene {rangosOcupados.length} {rangosOcupados.length === 1 ? "fecha reservada" : "fechas reservadas"}: si eliges fechas que se crucen, te avisaremos.</li>
                            )}
                        </ul>

                        {disponible ? (
                            <>
                                <Row className="g-2 mb-3">
                                    <Col xs={6}>
                                        <label className="form-label" htmlFor="dh-checkin">Check-in</label>
                                        <DatePicker id="dh-checkin"
                                            selected={checkIn ? aFecha(checkIn) : null}
                                            onChange={(date) => setCheckIn(date ? toLocalDateString(date) : "")}
                                            dateFormat="dd/MM/yyyy" locale="es" className="form-control"
                                            placeholderText="dd/mm/aaaa" minDate={new Date()} portalId="datepicker-portal" />
                                    </Col>
                                    <Col xs={6}>
                                        <label className="form-label" htmlFor="dh-checkout">Check-out</label>
                                        <DatePicker id="dh-checkout"
                                            selected={checkOut ? aFecha(checkOut) : null}
                                            onChange={(date) => setCheckOut(date ? toLocalDateString(date) : "")}
                                            dateFormat="dd/MM/yyyy" locale="es" className="form-control"
                                            placeholderText="dd/mm/aaaa" minDate={checkIn ? aFecha(checkIn) : new Date()}
                                            portalId="datepicker-portal" />
                                    </Col>
                                </Row>

                                <div className="dh-total">
                                    <span>{noches > 0 ? `${noches} ${noches === 1 ? "noche" : "noches"}` : "Precio por noche"}</span>
                                    <strong>{pesos(noches > 0 ? total : habitacion.precioNoche)}</strong>
                                </div>

                                <button type="button" className="btn-gb btn-gb-primary w-100 justify-content-center" onClick={handleReservar} disabled={reservando}>
                                    {reservando ? <><Spinner size="sm" /> Enviando…</> : "Enviar solicitud de reserva"}
                                </button>
                                <span className="gb-ayuda text-center mt-2">La reserva queda pendiente hasta que la administración la apruebe.</span>
                            </>
                        ) : (
                            <p className="gb-ayuda m-0">Esta habitación no está disponible por ahora. Mira otras en el catálogo.</p>
                        )}
                    </div>
                </Col>
            </Row>
        </div>
    );
}
