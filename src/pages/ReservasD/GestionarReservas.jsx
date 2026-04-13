import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaTrash } from "react-icons/fa";
import { listarReservasDeporte, cancelarReservaDeporte } from "../../api/ReservaDeporteApi";
import "../../styles/ReservasD/GestionarReservas.css"; // Asegúrate de tener este archivo CSS con los estilos necesarios

function GestionarReservas() {
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
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
      console.error(err);
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

  return (
    <div className="reservas-wrapper">
      <div className="header-reservas">
        <h2 className="title-reservas">GESTIÓN DE RESERVAS (MONGO DB)</h2>
        
        {/* Buscador corregido: ahora es "normal" y suave */}
        <input 
          type="text" 
          placeholder="Buscar reserva..." 
          className="search-input-reservas"
        />

        <button className="add-btn-reservas" onClick={() => navigate("/reservas-deportivas")}>
          <FaPlus /> NUEVA
        </button>
      </div>

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
            {reservas.map((r) => (
              <tr key={r.idD}>
                <td style={{ fontWeight: '500' }}>
                  {r.docUsuario ? r.docUsuario : "—"}
                </td>
                <td>
                  <span className="badge-cancha">{r.tCancha}</span>
                </td>
                <td>{new Date(r.fInicioReserva).toLocaleString()}</td>
                <td>{new Date(r.fFinReserva).toLocaleString()}</td>
                <td style={{ fontWeight: '600' }}>${r.pr?.toLocaleString()}</td>
                <td>
                  <span className={`badge ${r.estado === "CANCELADA" ? "bg-danger" : "bg-warning text-dark"}`} style={{fontSize: '0.7rem'}}>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GestionarReservas;