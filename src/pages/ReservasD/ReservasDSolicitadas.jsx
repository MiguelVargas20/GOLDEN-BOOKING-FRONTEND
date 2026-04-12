import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { listarMisReservasDeporte, cancelarReservaDeporte } from '../../api/ReservaDeporteApi';

function ReservasDSolicitadas() {
    const { user } = useAuth();
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        obtenerMisReservas();
    }, []);

   const obtenerMisReservas = async () => {
    try {
        const data = await listarMisReservasDeporte(user?.id);
        // ← agregar estos logs temporales
        console.log("user.id:", user?.id);
        console.log("reservas del back:", data);
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

    if (loading) return <div className="p-4">Cargando reservas...</div>;
    if (error) return <div className="alert alert-danger m-4">{error}</div>;

    return (
        <>
            <div className="titleRD">
                <h2>MIS RESERVAS DEPORTIVAS</h2>
            </div>

            {reservas.length === 0 ? (
                <div className="alert alert-info m-4">
                    No tienes reservas deportivas aún.
                </div>
            ) : (
                <div className="tabla-container p-4">
                    <table className="table table-hover shadow-sm">
                        <thead className="table-dark">
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
                                        <span className="badge bg-info text-dark">
                                            {r.tCancha}
                                        </span>
                                    </td>
                                    <td>{r.fInicioReserva ? new Date(r.fInicioReserva).toLocaleString() : "-"}</td>
                                    <td>{r.fFinReserva ? new Date(r.fFinReserva).toLocaleString() : "-"}</td>
                                    <td>${r.pr?.toLocaleString() || 0}</td>
                                    <td>
                                        <span className={`badge ${
                                            r.estado === "CANCELADA" ? "bg-danger" :
                                            r.estado === "CONFIRMADA" ? "bg-success" :
                                            "bg-warning text-dark"
                                        }`}>
                                            {r.estado || "PENDIENTE"}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-outline-danger btn-sm"
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
                </div>
            )}
        </>
    );
}

export default ReservasDSolicitadas;