import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsArrowClockwise, BsCalendarCheck, BsBoxArrowInRight, BsBoxArrowRight, BsCashCoin, BsEnvelope, BsHourglassSplit, BsPersonPlus, BsArrowUpRight, BsArrowDownRight, BsCalendar3Week, BsFileEarmarkBarGraph } from "react-icons/bs";
import { MdSportsTennis, MdKingBed } from "react-icons/md";
import { obtenerDashboard } from "../api/DashboardApi";
import { confirmarReservaDeporte, cancelarReservaDeporte } from "../../reservasDeportivas/api/ReservaDeporteApi";
import { confirmarReservaHotel, cancelarReservaHotel } from "../../reservasHoteleras/api/ReservaHotelApi";
import { aprobarReserva, cancelarReserva } from "../../../shared/components/reservas/dialogosReserva";
import { fechaHora, fecha, hora, pesos } from "../../../shared/utils/formato";
import { useCuentaAnimada } from "../hooks/useCuentaAnimada";
import { diaLargo, pesosCompactos } from "../utils/fechas";
import TarjetaKpi from "../components/TarjetaKpi";
import AnilloOcupacion from "../components/AnilloOcupacion";
import GraficoTendencia from "../components/GraficoTendencia";
import MapaHabitaciones from "../components/MapaHabitaciones";
import AgendaHoy from "../components/AgendaHoy";
import ListaPendientes from "../components/ListaPendientes";
import EspaciosTop from "../components/EspaciosTop";
import { EVENTO_RESERVAS_CAMBIARON } from "../../../shared/hooks/eventosReservas";
import "../../../shared/styles/PanelAdmin.css";
import "../styles/Dashboard.css";

const PERIODOS = [7, 14, 30];
const INTERVALO_REFRESCO_MS = 60000;

/** Variación porcentual contra el mes anterior (null si no hay base). */
const variacion = (actual, anterior) => (anterior > 0 ? ((actual - anterior) / anterior) * 100 : null);

/**
 * Panel de control del administrador: lo que pasa hoy (agenda, check-ins,
 * ocupación), lo que espera aprobación y cómo vienen las reservas. Se
 * actualiza solo cada minuto; mientras recarga se sigue viendo lo anterior.
 */
export default function DashboardAdmin() {
  const navigate = useNavigate();
  const [dias, setDias] = useState(14);
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const [recargando, setRecargando] = useState(false);
  const [procesando, setProcesando] = useState(null);
  const [ahora, setAhora] = useState(0);
  const pendientesRef = useRef(null);

  const cargar = useCallback(async () => {
    setRecargando(true);
    try {
      const d = await obtenerDashboard(dias);
      setDatos(d);
      setAhora(Date.now());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setRecargando(false);
    }
  }, [dias]);

  useEffect(() => {
    // primera carga en el siguiente tick (no en el cuerpo del efecto)
    const primera = setTimeout(cargar, 0);
    const intervalo = setInterval(() => {
      if (document.visibilityState === "visible") cargar();
    }, INTERVALO_REFRESCO_MS);
    // Aviso en vivo (nueva reserva / cancelación) → recargar al instante
    window.addEventListener(EVENTO_RESERVAS_CAMBIARON, cargar);
    return () => {
      clearTimeout(primera);
      clearInterval(intervalo);
      window.removeEventListener(EVENTO_RESERVAS_CAMBIARON, cargar);
    };
  }, [cargar]);

  // ── Acciones sobre pendientes ─────────────────────────────
  const detalles = (p) => ({
    Cliente: p.cliente,
    [p.tipo === "DEPORTE" ? "Espacio" : "Habitación"]: p.lugar,
    Fecha: p.tipo === "DEPORTE" ? `${fechaHora(p.inicio)} – ${hora(p.fin)}` : `${fecha(p.inicio)} → ${fecha(p.fin)}`,
    ...(p.total != null ? { Total: pesos(p.total) } : {}),
  });

  const aprobar = async (p) => {
    setProcesando(p.idReserva);
    // al aprobar/cancelar, el evento "reservas cambiaron" recarga el panel
    await aprobarReserva(detalles(p), () =>
      p.tipo === "DEPORTE" ? confirmarReservaDeporte(p.idReserva) : confirmarReservaHotel(p.idReserva));
    setProcesando(null);
  };

  const cancelar = async (p) => {
    setProcesando(p.idReserva);
    await cancelarReserva(detalles(p), (motivo) =>
      p.tipo === "DEPORTE" ? cancelarReservaDeporte(p.idReserva, motivo) : cancelarReservaHotel(p.idReserva, motivo), true);
    setProcesando(null);
  };

  if (!datos) {
    return (
      <div className="gb-panel db-panel">
        {error ? (
          <div className="alert alert-danger d-flex justify-content-between align-items-center">
            {error}
            <button type="button" className="btn-gb btn-gb-neutral btn-gb-sm" onClick={cargar}>Reintentar</button>
          </div>
        ) : <EsqueletoDashboard />}
      </div>
    );
  }

  const ind = datos.indicadores;
  const totalPendientes = ind.pendientesDeporte + ind.pendientesHotel;
  const delta = variacion(ind.ingresosMes, ind.ingresosMesAnterior);

  return (
    <div className={`gb-panel db-panel ${recargando ? "recargando" : ""}`}>
      {/* ── Encabezado ── */}
      <header className="gb-panel-header">
        <div>
          <h1 className="gb-panel-titulo">Panel de <span>control</span></h1>
          <p className="gb-panel-subtitulo db-capitalizar">
            {diaLargo(datos.fecha)} · actualizado {hora(datos.generadoEn)}
          </p>
        </div>
        <div className="gb-panel-acciones">
          <button type="button" className="btn-gb btn-gb-neutral btn-gb-sm" onClick={() => navigate("/calendario")}>
            <BsCalendar3Week /> Calendario
          </button>
          <button type="button" className="btn-gb btn-gb-neutral btn-gb-sm" onClick={() => navigate("/reportes")}>
            <BsFileEarmarkBarGraph /> Reportes
          </button>
          <button type="button" className="btn-gb btn-gb-neutral btn-gb-sm" onClick={() => navigate("/recepcion/nueva-reserva?tipo=deporte")}>
            <BsPersonPlus /> Reservar para un cliente
          </button>
          <button type="button" className={`db-refrescar ${recargando ? "girando" : ""}`} onClick={cargar}
            disabled={recargando} aria-label="Actualizar" title="Actualizar">
            <BsArrowClockwise />
          </button>
        </div>
      </header>

      {error && <div className="alert alert-warning py-2">No se pudo actualizar: {error}. Se muestran los últimos datos.</div>}

      {/* ── Indicadores ── */}
      <section className="db-indicadores">
        <HeroPendientes
          total={totalPendientes}
          deporte={ind.pendientesDeporte}
          hotel={ind.pendientesHotel}
          onRevisar={() => pendientesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
        />
        <TarjetaKpi indice={1} icono={<MdSportsTennis />} titulo="Reservas deportivas hoy" valor={ind.reservasDeporteHoy}
          variante="db-kpi-deporte" onClick={() => navigate("/reservas-deportivas/gestionar")} />
        <TarjetaKpi indice={2} icono={<BsBoxArrowInRight />} titulo="Check-ins hoy" valor={ind.checkInsHoy}
          variante="db-kpi-checkin" onClick={() => navigate("/reservas-hoteleras/gestionar")} />
        <TarjetaKpi indice={3} icono={<BsBoxArrowRight />} titulo="Check-outs hoy" valor={ind.checkOutsHoy}
          variante="db-kpi-checkout" onClick={() => navigate("/reservas-hoteleras/gestionar")} />
        <TarjetaKpi indice={4} icono={<BsCashCoin />} titulo="Ingresos del mes" valor={ind.ingresosMes}
          formato={pesosCompactos} variante="db-kpi-ingresos"
          pie={delta == null ? "Sin datos del mes anterior" : (
            <span className={delta >= 0 ? "db-sube" : "db-baja"}>
              {delta >= 0 ? <BsArrowUpRight /> : <BsArrowDownRight />} {Math.abs(delta).toFixed(0)}% vs mes anterior
            </span>
          )} />
        <TarjetaKpi indice={5} icono={<BsEnvelope />} titulo="Mensajes sin leer" valor={ind.mensajesNoLeidos}
          variante="db-kpi-mensajes" onClick={() => navigate("/mensajes")} />
      </section>

      <div className="db-rejilla-principal">
        {/* ── Columna amplia ── */}
        <div className="db-columna-amplia">
          <section className="db-tarjeta db-aparecer" style={{ "--retraso": "120ms" }}>
            <div className="db-tarjeta-cabecera">
              <div>
                <h2>Reservas recibidas</h2>
                <p className="db-muted">Solicitudes nuevas por día · últimos {datos.periodoDias} días</p>
              </div>
              <div className="db-filtros db-filtros-compactos" role="group" aria-label="Periodo">
                {PERIODOS.map((p) => (
                  <button key={p} type="button" className={`db-filtro ${dias === p ? "activo" : ""}`}
                    onClick={() => setDias(p)} aria-pressed={dias === p}>
                    {p} días
                  </button>
                ))}
              </div>
            </div>
            <GraficoTendencia puntos={datos.tendencia} />
          </section>

          <section className="db-tarjeta db-aparecer" style={{ "--retraso": "180ms" }}>
            <div className="db-tarjeta-cabecera">
              <div>
                <h2>Habitaciones hoy</h2>
                <p className="db-muted">
                  {ind.habitacionesOcupadas} ocupadas · {ind.habitacionesReservadasPendientes} por aprobar · {ind.habitacionesMantenimiento} en mantenimiento
                </p>
              </div>
              <AnilloOcupacion ocupadas={ind.habitacionesOcupadas} pendientes={ind.habitacionesReservadasPendientes}
                total={ind.habitacionesTotal} mantenimiento={ind.habitacionesMantenimiento} />
            </div>
            <MapaHabitaciones habitaciones={datos.habitaciones} />
          </section>
        </div>

        {/* ── Columna lateral ── */}
        <div className="db-columna-lateral">
          <section className="db-tarjeta db-aparecer" ref={pendientesRef} style={{ "--retraso": "150ms" }}>
            <div className="db-tarjeta-cabecera">
              <div>
                <h2>Por aprobar</h2>
                <p className="db-muted">Las más próximas primero</p>
              </div>
              {totalPendientes > datos.pendientes.length && (
                <button type="button" className="db-enlace" onClick={() => navigate(
                  ind.pendientesDeporte >= ind.pendientesHotel ? "/reservas-deportivas/gestionar" : "/reservas-hoteleras/gestionar")}>
                  Ver todas ({totalPendientes})
                </button>
              )}
            </div>
            <ListaPendientes pendientes={datos.pendientes} onAprobar={aprobar} onCancelar={cancelar} procesando={procesando} />
          </section>

          <section className="db-tarjeta db-aparecer" style={{ "--retraso": "210ms" }}>
            <div className="db-tarjeta-cabecera">
              <div>
                <h2>Agenda de hoy</h2>
                <p className="db-muted">{datos.agendaHoy.length} {datos.agendaHoy.length === 1 ? "evento" : "eventos"}</p>
              </div>
              <BsCalendarCheck className="db-cabecera-icono" />
            </div>
            <AgendaHoy eventos={datos.agendaHoy} ahora={ahora} />
          </section>

          <section className="db-tarjeta db-aparecer" style={{ "--retraso": "240ms" }}>
            <div className="db-tarjeta-cabecera">
              <div>
                <h2>Espacios más reservados</h2>
                <p className="db-muted">Últimos {datos.periodoDias} días · reservas y horas</p>
              </div>
            </div>
            <EspaciosTop espacios={datos.espaciosTop} />
          </section>
        </div>
      </div>
    </div>
  );
}

/** Tarjeta principal: total de reservas esperando aprobación. */
function HeroPendientes({ total, deporte, hotel, onRevisar }) {
  const animado = useCuentaAnimada(total);
  return (
    <div className={`db-hero db-aparecer ${total > 0 ? "con-pendientes" : ""}`}>
      <div className="db-hero-cabecera">
        <span className="db-kpi-icono"><BsHourglassSplit /></span>
        <span className="db-kpi-titulo">Pendientes por aprobar</span>
      </div>
      <strong className="db-hero-valor">{Math.round(animado)}</strong>
      <div className="db-hero-desglose">
        <span><MdSportsTennis /> {deporte} deportivas</span>
        <span><MdKingBed /> {hotel} hoteleras</span>
      </div>
      {total > 0 && (
        <button type="button" className="btn-gb btn-gb-primary btn-gb-sm" onClick={onRevisar}>Revisar ahora</button>
      )}
    </div>
  );
}

/** Marcadores de carga con la forma del panel (evita el salto al llegar los datos). */
function EsqueletoDashboard() {
  return (
    <div aria-busy="true" aria-label="Cargando panel">
      <div className="db-esqueleto db-esqueleto-titulo" />
      <div className="db-indicadores">
        {Array.from({ length: 6 }, (_, i) => <div key={i} className="db-esqueleto db-esqueleto-kpi" />)}
      </div>
      <div className="db-rejilla-principal">
        <div className="db-esqueleto db-esqueleto-bloque" />
        <div className="db-esqueleto db-esqueleto-bloque" />
      </div>
    </div>
  );
}
