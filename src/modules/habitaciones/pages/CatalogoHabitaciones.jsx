import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BsCashCoin, BsPeople, BsCalendarCheck, BsClockHistory, BsGear } from "react-icons/bs";
import { Spinner } from "react-bootstrap";
import { listarTodasLasHabitaciones } from "../api/HabitacionApi";
import { crearReservaHotel, obtenerFechasOcupadas } from "../../reservasHoteleras/api/ReservaHotelApi";
import { obtenerResumenCalificaciones } from "../../calificaciones/api/CalificacionApi";
import { PromedioCalificacion } from "../../calificaciones/components/Estrellas";
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
import "../../../shared/styles/PanelAdmin.css";
import "../../../shared/styles/Catalogo.css";
import "../../../shared/styles/BotonesCompartidos.css";
import "../styles/CatalogoHabitaciones.css";
import { escapeHtml } from "../../../shared/utils/escapeHtml";
import { fecha, pesos } from "../../../shared/utils/formato";

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
    const [calificaciones, setCalificaciones] = useState({});

    // Estrellas de cada habitación (extra: si fallan, el catálogo se muestra igual)
    useEffect(() => {
        obtenerResumenCalificaciones("HOTEL").then(setCalificaciones).catch(() => {});
    }, []);

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
            html: `<div class="gb-swal-detalle">
                    <div><span>Habitación</span><strong>${escapeHtml(hab.numeroHabitacion)}</strong></div>
                    <div><span>Check-in</span><strong>${fecha(habFechas.checkIn)} · 3:00 p. m.</strong></div>
                    <div><span>Check-out</span><strong>${fecha(habFechas.checkOut)} · 12:00 m.</strong></div>
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

    return (
        <div className="gb-panel">
            <div className="gb-panel-header">
                <div>
                    <h1 className="gb-panel-titulo">Nuestras <span>habitaciones</span></h1>
                    <p className="gb-panel-subtitulo">Elige tus fechas y envía tu solicitud: queda pendiente hasta que sea aprobada.</p>
                </div>
                <div className="gb-panel-acciones">
                    {isAdmin() && (
                        <button type="button" className="btn-gb btn-gb-neutral btn-gb-sm" onClick={() => navigate("/habitaciones/gestionar")}>
                            <BsGear /> Gestionar
                        </button>
                    )}
                    <button type="button" className="btn-gb btn-gb-primary btn-gb-sm" onClick={() => navigate("/reservas-hoteleras/mis-reservas")}>
                        <BsClockHistory /> Mis reservas
                    </button>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="ch-filtros">
                <div className="gb-chips" role="group" aria-label="Filtrar por tipo">
                    {["Todos", ...tiposDisponibles].map((t) => (
                        <button key={t} type="button" className={`gb-chip ${filterTipo === t ? "activo" : ""}`}
                            onClick={() => setFilterTipo(t)} aria-pressed={filterTipo === t}>
                            {t === "Todos" ? "Todos los tipos" : t}
                        </button>
                    ))}
                </div>
                <select className="form-select ch-orden" value={ordenPrecio} onChange={(e) => setOrdenPrecio(e.target.value)} aria-label="Ordenar por precio">
                    <option value="normal">Sin orden</option>
                    <option value="asc">Precio: menor a mayor</option>
                    <option value="desc">Precio: mayor a menor</option>
                </select>
            </div>

            {habitacionesFiltradas.length === 0 ? (
                <div className="gb-vacio"><p className="m-0">No hay habitaciones con esos criterios.</p></div>
            ) : (
                <div className="ge-grid ch-grid">
                    {habitacionesFiltradas.map((hab) => {
                        const habFechas = getFechasHab(hab.id);
                        const disponible = hab.estadoHabitacion === "DISPONIBLE";
                        const { noches, total } = calcularNochesYTotal(hab);
                        const ocupadas = rangosOcupadosPorHabitacion[hab.id] || [];
                        const tipo = datosTipo(hab);

                        return (
                            <article key={hab.id} className={`ge-card ${disponible ? "" : "atenuada"}`}>
                                <div className="ge-imagen">
                                    <img src={imagenHabitacion(hab)} onError={usarImagenDeRespaldoHabitacion} alt={`Habitación ${hab.numeroHabitacion}`} loading="lazy" />
                                    <span className={`ge-estado ${disponible ? "ge-estado-activo" : "ge-estado-mantenimiento"}`}>
                                        {disponible ? "Disponible" : hab.estadoHabitacion === "OCUPADA" ? "Ocupada" : "Mantenimiento"}
                                    </span>
                                </div>
                                <div className="ge-cuerpo">
                                    <span className="ge-deporte">{tipo.nombre || "Habitación"}</span>
                                    <h3 className="ge-nombre">Habitación {hab.numeroHabitacion}</h3>
                                    <PromedioCalificacion resumen={calificaciones[hab.id]} />
                                    {hab.descripcion && <p className="ge-descripcion">{hab.descripcion}</p>}
                                    <ul className="ge-datos">
                                        <li><BsCashCoin /> {pesos(hab.precioNoche)} / noche</li>
                                        <li><BsPeople /> Hasta {tipo.capacidad ?? "—"} personas</li>
                                        {ocupadas.length > 0 && (
                                            <li><BsCalendarCheck /> {ocupadas.length} {ocupadas.length === 1 ? "fecha reservada" : "fechas reservadas"}: evita cruzarlas</li>
                                        )}
                                    </ul>

                                    {disponible && (
                                        <div className="ch-fechas">
                                            <label>
                                                <span>Check-in</span>
                                                <DatePicker
                                                    selected={habFechas.checkIn ? aFecha(habFechas.checkIn) : null}
                                                    onChange={(date) => setFechaHab(hab.id, "checkIn", date ? toLocalDateString(date) : "")}
                                                    dateFormat="dd/MM/yyyy" locale="es" className="form-control"
                                                    placeholderText="dd/mm/aaaa" minDate={new Date()} portalId="datepicker-portal"
                                                />
                                            </label>
                                            <label>
                                                <span>Check-out</span>
                                                <DatePicker
                                                    selected={habFechas.checkOut ? aFecha(habFechas.checkOut) : null}
                                                    onChange={(date) => setFechaHab(hab.id, "checkOut", date ? toLocalDateString(date) : "")}
                                                    dateFormat="dd/MM/yyyy" locale="es" className="form-control"
                                                    placeholderText="dd/mm/aaaa"
                                                    minDate={habFechas.checkIn ? aFecha(habFechas.checkIn) : new Date()}
                                                    portalId="datepicker-portal"
                                                />
                                            </label>
                                        </div>
                                    )}
                                    {noches > 0 && (
                                        <p className="ch-total">{noches} {noches === 1 ? "noche" : "noches"} · <strong>{pesos(total)}</strong></p>
                                    )}

                                    <div className="ch-acciones">
                                        <button type="button" className="btn-gb btn-gb-secondary btn-gb-sm" onClick={() => navigate(`/habitaciones/${hab.id}`)}>
                                            Ver detalle
                                        </button>
                                        <button type="button" className="btn-gb btn-gb-primary btn-gb-sm" onClick={() => handleReservar(hab)}
                                            disabled={!disponible || reservando === hab.id}>
                                            {reservando === hab.id ? <><Spinner size="sm" /> Enviando…</> : disponible ? "Reservar" : "No disponible"}
                                        </button>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
