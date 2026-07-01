import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaTrash } from "react-icons/fa";
import { listarReservasDeporte, cancelarReservaDeporte } from "../../api/ReservaDeporteApi";
import "../../styles/ReservasD/GestionarReservas.css";
import Swal from "sweetalert2";

const TAMANIO_PAGINA = 8;

function GestionarReservas() {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [reservas, setReservas]               = useState([]);
  const [busqueda, setBusqueda]               = useState("");
  const [busquedaDebounced, setBusquedaDebounced] = useState("");

  const [error, setError]                     = useState(null);
  const [paginaActual, setPaginaActual]       = useState(0);
  const [totalPaginas, setTotalPaginas]       = useState(0);
  const [totalElementos, setTotalElementos]   = useState(0);
  
  const capitalizar = (texto) =>
    texto ? texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase() : "—";

  useEffect(() => {
    const timer = setTimeout(() => {
      setBusquedaDebounced(busqueda);
    }, 300);

    return () => clearTimeout(timer); // cancela el timer anterior si el user sigue tecleando
  }, [busqueda]);

  useEffect(() => { obtenerDatos(0); }, []);
  
  const obtenerDatos = async (pagina = 0) => {
    setCargando(true);
    try {
      const data = await listarReservasDeporte(pagina, TAMANIO_PAGINA);
      setReservas(data.contenido);
      setPaginaActual(data.paginaActual);
      setTotalPaginas(data.totalPaginas);
      setTotalElementos(data.totalElementos);
    } catch (err) {
      setError("No se pudieron cargar las reservas");
    } finally {
      setCargando(false);
    }
  };

  const handleCancelar = async (id, cancha) => {
    const resultado = await Swal.fire({
      title: "¿Cancelar reserva?",
      html: `<p>La reserva de <strong>${cancha}</strong> será cancelada.</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "Mantener",
      confirmButtonColor: "#e53e3e",
      cancelButtonColor: "#6c757d",
    });

    if (!resultado.isConfirmed) return;

    try {
      await cancelarReservaDeporte(id);
      await Swal.fire({
        title: "¡Cancelada!",
        text: "La reserva fue cancelada correctamente.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      obtenerDatos(paginaActual);
    } catch {
      Swal.fire({
        title: "Error",
        text: "No se pudo cancelar la reserva.",
        icon: "error",
        confirmButtonColor: "#f38d1e",
      });
    }
  };

  // Filtro local utilizando el valor debounced (Protege el rendimiento en renderizados sucesivos)
  const reservasFiltradas = reservas.filter(r =>
    r.tCancha?.toLowerCase().includes(busquedaDebounced.toLowerCase()) ||
    r.docUsuario?.toLowerCase().includes(busquedaDebounced.toLowerCase()) ||
    r.estado?.toLowerCase().includes(busquedaDebounced.toLowerCase())
  );

  return (
    <div className="reservas-wrapper">
      <div className="header-reservas">
        <h2 className="title-reservas">GESTIÓN DE RESERVAS</h2>
        <input
          type="text"
          placeholder="Buscar por cancha, usuario o estado..."
          className="search-input-reservas"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button className="add-btn-reservas" onClick={() => navigate("/reservas-deportivas")}>
          <FaPlus /> NUEVA
        </button>
      </div>

      {error && <div className="alert alert-danger m-3">{error}</div>}

      <div className="tabla-container-suave">
        <table className="reservas-table">
          <thead>
            <tr>
              <th>USUARIO</th>
              <th>CANCHA</th>
              <th>INICIO</th>
              <th>FIN</th>
              <th>PRECIO</th>
              <th>ESTADO</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={7} className="text-center py-4">
                  Cargando reservas...
                </td>
              </tr>
            ) : reservasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4">
                  No hay reservas que coincidan
                </td>
              </tr>
            ) : (
              reservasFiltradas.map((r) => (
                <tr key={r.idD}>
                  <td>{r.docUsuario ? r.docUsuario.slice(-8) : "—"}</td>
                  <td><span className="badge-cancha">{capitalizar(r.tCancha)}</span></td>
                  <td>{r.fInicioReserva ? new Date(r.fInicioReserva).toLocaleString() : "—"}</td>
                  <td>{r.fFinReserva ? new Date(r.fFinReserva).toLocaleString() : "—"}</td>
                  <td>${r.pr?.toLocaleString() || 0}</td>
                  <td>
                    <span className={`badge ${
                      r.estado === "CANCELADA" ? "bg-danger" :
                      r.estado === "CONFIRMADA" ? "bg-success" :
                      "bg-warning text-dark"
                    }`} style={{ fontSize: "0.7rem" }}>
                      {r.estado || "PENDIENTE"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-cancelar-outline"
                      onClick={() => handleCancelar(r.idD, r.tCancha)}
                      disabled={r.estado === "CANCELADA"}
                    >
                      <FaTrash /> Cancelar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3 px-3">
          <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
            Página {paginaActual + 1} de {totalPaginas} — {totalElementos} reservas
          </span>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => obtenerDatos(paginaActual - 1)}
              disabled={paginaActual === 0}
            >
              ← Anterior
            </button>
            {[...Array(totalPaginas)].map((_, i) => (
              <button
                key={i}
                className="btn btn-sm"
                onClick={() => obtenerDatos(i)}
                style={{
                  background: i === paginaActual ? "#f38d1e" : "transparent",
                  border: "1px solid #dee2e6",
                  color: i === paginaActual ? "#fff" : "#6c757d",
                  fontWeight: i === paginaActual ? 700 : 400,
                }}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => obtenerDatos(paginaActual + 1)}
              disabled={paginaActual === totalPaginas - 1}
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionarReservas;