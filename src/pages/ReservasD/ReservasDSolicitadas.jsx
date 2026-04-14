import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { listarMisReservasDeporte, cancelarReservaDeporte } from '../../api/ReservaDeporteApi';
import '../../styles/ReservasD/MisReservas.css';

function ReservasDSolicitadas() {
    const { user } = useAuth();
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const capitalizar = (texto) =>
        texto ? texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase() : "—";

    useEffect(() => { obtenerMisReservas(); }, []);

    const obtenerMisReservas = async () => {
        try {
            const data = await listarMisReservasDeporte(user?.id);
            setReservas(data);
        } catch (err) {
            setError("No se pudieron cargar tus reservas");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelar = async (id) => {
        if (!window.confirm("¿Deseas cancelar esta reserva?")) return;
        try {
            await cancelarReservaDeporte(id);
            obtenerMisReservas();
        } catch {
            alert("Error al cancelar la reserva");
        }
    };

    if (loading) return <div className="mis-reservas-loading">Cargando reservas...</div>;

    return (
        <div className="mis-reservas-page">

            {/* Header igual que UsuariosH */}
            <div className="mis-reservas-header">
                <h1 className="mis-reservas-title">MIS RESERVAS DEPORTIVAS</h1>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {reservas.length === 0 ? (
                <div className="mis-reservas-empty">
                    <p>No tienes reservas deportivas aún.</p>
                    <span>¡Reserva tu primer espacio desde el catálogo!</span>
                </div>
            ) : (
                <table className="mis-reservas-table">
                    <thead>
                        <tr>
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
                                <td>
                                    <span className="mis-reservas-badge">
                                        {capitalizar(r.tCancha)}
                                    </span>
                                </td>
                                <td>{r.fInicioReserva ? new Date(r.fInicioReserva).toLocaleString() : "—"}</td>
                                <td>{r.fFinReserva ? new Date(r.fFinReserva).toLocaleString() : "—"}</td>
                                <td>${r.pr?.toLocaleString() || 0}</td>
                                <td>
                                    <span className={`mis-reservas-estado ${
                                        r.estado === "CANCELADA" ? "cancelada" :
                                        r.estado === "CONFIRMADA" ? "confirmada" : "pendiente"
                                    }`}>
                                        {r.estado || "PENDIENTE"}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        className="mis-reservas-btn-cancelar"
                                        onClick={() => handleCancelar(r.idD)}
                                        disabled={r.estado === "CANCELADA"}
                                    >
                                        Cancelar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default ReservasDSolicitadas;