import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaTrash } from "react-icons/fa";
import { listarReservasDeporte, cancelarReservaDeporte } from "../../api/ReservaDeporteApi";
import "../../styles/ReservasD/GestionarReservas.css";

function GestionarReservas() {
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState(null);

  const capitalizar = (texto) =>
    texto ? texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase() : "—";

  useEffect(() => {
    obtenerDatos();
  }, []);

  const obtenerDatos = async () => {
    try {
      const data = await listarReservasDeporte();
      setReservas(data);
    } catch (err) {
      setError("No se pudieron cargar las reservas");
    }
  };

  const handleCancelar = async (id) => {
    if (window.confirm("¿Deseas cancelar esta reserva?")) {
      try {
        await cancelarReservaDeporte(id);
        obtenerDatos();
      } catch (err) {
        alert("Error al cancelar la reserva");
      }
    }
  };

  // ← Filtrar por cancha, usuario o estado
  const reservasFiltradas = reservas.filter(r =>
    r.tCancha?.toLowerCase().includes(busqueda.toLowerCase()) ||
    r.docUsuario?.toLowerCase().includes(busqueda.toLowerCase()) ||
    r.estado?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="reservas-wrapper">
      <div className="header-reservas">
        <h2 className="title-reservas">GESTIÓN DE RESERVAS</h2>

        {/* ← Buscador conectado al estado */}
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
            {reservasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4">
                  No hay reservas que coincidan
                </td>
              </tr>
            ) : (
              reservasFiltradas.map((r) => (
                <tr key={r.idD}>
                  <td>
                    {/* ← Mostrar últimos 8 chars del docUsuario */}
                    {r.docUsuario ? r.docUsuario.slice(-8) : "—"}
                  </td>
                  <td>
                    <span className="badge-cancha">{capitalizar(r.tCancha)}</span>
                  </td>
                  <td>{r.fInicioReserva ? new Date(r.fInicioReserva).toLocaleString() : "—"}</td>
                  <td>{r.fFinReserva ? new Date(r.fFinReserva).toLocaleString() : "—"}</td>
                  <td>${r.pr?.toLocaleString() || 0}</td>
                  <td>
                    <span className={`badge ${
                      r.estado === "CANCELADA" ? "bg-danger" :
                      r.estado === "CONFIRMADA" ? "bg-success" :
                      "bg-warning text-dark"
                    }`} style={{fontSize: '0.7rem'}}>
                      {r.estado || "PENDIENTE"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-cancelar-outline"
                      onClick={() => handleCancelar(r.idD)}
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
    </div>
  );
}

export default GestionarReservas;