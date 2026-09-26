import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { BsCheckLg, BsXLg, BsArrowClockwise, BsCalendar2Week, BsClockHistory } from "react-icons/bs";
import ResumenEstados from "./ResumenEstados";
import EstadoReservaBadge from "./EstadoReservaBadge";
import Paginador from "./Paginador";
import ModalReprogramar from "./ModalReprogramar";
import { aprobarReserva, cancelarReserva } from "./dialogosReserva";
import { verHistorial } from "./historialReserva";
import { EVENTO_RESERVAS_CAMBIARON, avisarReservasCambiaron } from "../../hooks/eventosReservas";
import "../../styles/PanelAdmin.css";
import "../../styles/BotonesCompartidos.css";

const TAMANIO_PAGINA = 10;
const ESTADOS_VALIDOS = ["PENDIENTE", "CONFIRMADA", "CANCELADA", "FINALIZADA"];

/**
 * Panel del ADMIN para gestionar reservas (lo usan hotel y deporte).
 *
 * - Indicadores por estado (clic = filtrar). El filtro queda en la URL
 *   (?estado=PENDIENTE) para poder enlazarlo desde el Navbar.
 * - Tabla paginada desde el backend, con búsqueda local en la página actual.
 * - Acciones: aprobar (solo PENDIENTE), cambiar la fecha y cancelar con motivo
 *   (PENDIENTE o CONFIRMADA) y ver el historial (quién aprobó o canceló y cuándo).
 *
 * @param {string} titulo / resaltado / subtitulo - textos del encabezado
 * @param {Function} listar(page, size, estado) - API del listado
 * @param {Function} resumen() - API del resumen por estado
 * @param {Function} confirmar(id) - API para aprobar
 * @param {Function} cancelar(id, motivo) - API para cancelar
 * @param {Function} obtenerId(reserva)
 * @param {Array} columnas - [{ titulo, render: (reserva) => JSX }]
 * @param {Function} detalles(reserva) - { etiqueta: valor } para los diálogos
 * @param {Function} textoBusqueda(reserva) - texto sobre el que se busca
 * @param {Function} reprogramar(id, inicio, fin) - API para cambiar la fecha
 * @param {Function} datosReprogramacion(reserva) - { tipo, id, lugar, inicio, fin, espacioId?, precioNoche? }
 * @param {ReactNode} accionesExtra - botones adicionales del encabezado
 */
export default function PanelReservasAdmin({
  titulo, resaltado, subtitulo,
  listar, resumen, confirmar, cancelar, reprogramar, datosReprogramacion,
  obtenerId, columnas, detalles, textoBusqueda,
  accionesExtra,
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const estadoUrl = searchParams.get("estado");
  const filtro = ESTADOS_VALIDOS.includes(estadoUrl) ? estadoUrl : null;

  const [reservas, setReservas] = useState([]);
  const [totales, setTotales] = useState({});
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [reprogramando, setReprogramando] = useState(null);

  const cargar = useCallback(async (paginaSolicitada = 0) => {
    setCargando(true);
    setError(null);
    try {
      const [datos, conteo] = await Promise.all([
        listar(paginaSolicitada, TAMANIO_PAGINA, filtro),
        resumen(),
      ]);
      setReservas(datos.contenido || []);
      setPagina(datos.paginaActual || 0);
      setTotalPaginas(datos.totalPaginas || 0);
      setTotalElementos(datos.totalElementos || 0);
      setTotales(conteo || {});
    } catch (err) {
      setError(err.message || "No se pudieron cargar las reservas.");
    } finally {
      setCargando(false);
    }
  }, [listar, resumen, filtro]);

  useEffect(() => { cargar(0); }, [cargar]);

  // Aviso en vivo (un cliente creó o canceló una reserva): recargar la página
  // actual. Los eventos sin detalle vienen de las acciones de esta misma
  // pantalla, que ya recargan por su cuenta.
  const paginaRef = useRef(0);
  useEffect(() => { paginaRef.current = pagina; }, [pagina]);
  useEffect(() => {
    const alAviso = (e) => { if (e.detail) cargar(paginaRef.current); };
    window.addEventListener(EVENTO_RESERVAS_CAMBIARON, alAviso);
    return () => window.removeEventListener(EVENTO_RESERVAS_CAMBIARON, alAviso);
  }, [cargar]);

  const filtrar = (estado) => {
    setBusqueda("");
    setSearchParams(estado ? { estado } : {});
  };

  const handleAprobar = async (reserva) => {
    const aprobada = await aprobarReserva(detalles(reserva), () => confirmar(obtenerId(reserva)));
    if (aprobada) cargar(pagina);
  };

  const handleCancelar = async (reserva) => {
    const cancelada = await cancelarReserva(detalles(reserva), (motivo) => cancelar(obtenerId(reserva), motivo), true);
    if (cancelada) cargar(pagina);
  };

  const guardarReprogramacion = async (inicio, fin) => {
    await reprogramar(reprogramando.id, inicio, fin);
    setReprogramando(null);
    avisarReservasCambiaron();
    await Swal.fire({ title: "Fecha actualizada", text: "Se le avisó al cliente por correo y en su campana.", icon: "success", timer: 2200, showConfirmButton: false });
    cargar(pagina);
  };

  const termino = busqueda.trim().toLowerCase();
  const visibles = termino
    ? reservas.filter((r) => (textoBusqueda(r) || "").toLowerCase().includes(termino))
    : reservas;

  return (
    <div className="gb-panel">
      <div className="gb-panel-header">
        <div>
          <h1 className="gb-panel-titulo">{titulo} <span>{resaltado}</span></h1>
          {subtitulo && <p className="gb-panel-subtitulo">{subtitulo}</p>}
        </div>
        <div className="gb-panel-acciones">
          <input
            type="search"
            className="gb-buscador"
            placeholder="Buscar en esta página..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <button type="button" className="btn-gb btn-gb-secondary btn-gb-sm" onClick={() => cargar(pagina)} title="Actualizar">
            <BsArrowClockwise /> Actualizar
          </button>
          {accionesExtra}
        </div>
      </div>

      <ResumenEstados resumen={totales} filtro={filtro} onFiltrar={filtrar} />

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="gb-tabla-contenedor">
        <table className="gb-tabla">
          <thead>
            <tr>
              {columnas.map((c) => <th key={c.titulo}>{c.titulo}</th>)}
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan={columnas.length + 2} className="gb-tabla-vacia">Cargando reservas...</td></tr>
            ) : visibles.length === 0 ? (
              <tr>
                <td colSpan={columnas.length + 2} className="gb-tabla-vacia">
                  {filtro ? "No hay reservas en este estado." : "No hay reservas registradas."}
                </td>
              </tr>
            ) : (
              visibles.map((r) => (
                <tr key={obtenerId(r)}>
                  {columnas.map((c) => <td key={c.titulo}>{c.render(r)}</td>)}
                  <td>
                    <EstadoReservaBadge estado={r.estado} />
                    {r.estado === "CANCELADA" && r.canceladaPor === "SISTEMA" && (
                      <span className="gb-celda-secundaria" title={r.motivoCancelacion}>Vencida: no se aprobó a tiempo</span>
                    )}
                    {r.estado === "CANCELADA" && r.canceladaPor !== "SISTEMA" && r.motivoCancelacion && (
                      <span className="gb-celda-motivo" title={r.motivoCancelacion}>
                        {r.canceladaPor === "CLIENTE" ? "Cliente: " : "Motivo: "}{r.motivoCancelacion}
                      </span>
                    )}
                    {r.estado === "CANCELADA" && !r.motivoCancelacion && r.canceladaPor === "CLIENTE" && (
                      <span className="gb-celda-secundaria">Cancelada por el cliente</span>
                    )}
                  </td>
                  <td>
                    <div className="gb-acciones-fila">
                      {r.estado === "PENDIENTE" && (
                        <button type="button" className="btn-gb btn-gb-sm gb-btn-aprobar" onClick={() => handleAprobar(r)}>
                          <BsCheckLg /> Aprobar
                        </button>
                      )}
                      {(r.estado === "PENDIENTE" || r.estado === "CONFIRMADA") && reprogramar && (
                        <button type="button" className="btn-gb btn-gb-neutral btn-gb-sm" title="Cambiar fecha"
                          aria-label="Cambiar fecha" onClick={() => setReprogramando(datosReprogramacion(r))}>
                          <BsCalendar2Week />
                        </button>
                      )}
                      {(r.estado === "PENDIENTE" || r.estado === "CONFIRMADA") && (
                        <button type="button" className="btn-gb btn-gb-danger btn-gb-sm" onClick={() => handleCancelar(r)}>
                          <BsXLg /> Cancelar
                        </button>
                      )}
                      <button type="button" className="btn-gb btn-gb-secondary btn-gb-sm" title="Historial"
                        aria-label="Ver historial" onClick={() => verHistorial("Historial de la reserva", r)}>
                        <BsClockHistory />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Paginador
        pagina={pagina}
        totalPaginas={totalPaginas}
        totalElementos={totalElementos}
        etiqueta="reservas"
        onCambiar={cargar}
      />

      {reprogramando && (
        <ModalReprogramar reserva={reprogramando} onCerrar={() => setReprogramando(null)} onGuardar={guardarReprogramacion} />
      )}
    </div>
  );
}
