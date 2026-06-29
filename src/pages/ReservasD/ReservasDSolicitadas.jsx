import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { listarMisReservasDeporte, cancelarReservaDeporte } from '../../api/ReservaDeporteApi';
import '../../styles/ReservasD/MisReservas.css';
import Swal from 'sweetalert2';

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
            const data = await listarMisReservasDeporte(user?.numeroDocumento || user?.id);
            setReservas(data);
        } catch (err) {
            setError("No se pudieron cargar tus reservas");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelar = async (id, cancha, fechaInicio) => {
    const resultado = await Swal.fire({
        title: '¿Cancelar reserva?',
        html: `
            <p><strong>Cancha:</strong> ${cancha}</p>
            <p><strong>Fecha:</strong> ${new Date(fechaInicio).toLocaleString()}</p>
            <p style="color:#e53e3e;margin-top:8px">Esta acción no se puede deshacer.</p>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cancelar reserva',
        cancelButtonText: 'Mantener reserva',
        confirmButtonColor: '#e53e3e',
        cancelButtonColor: '#6c757d',
    });

    if (!resultado.isConfirmed) return;

    try {
        await cancelarReservaDeporte(id);
        await Swal.fire({
            title: '¡Reserva cancelada!',
            text: 'Tu reserva fue cancelada correctamente.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
        });
        obtenerMisReservas();
    } catch (err) {
        // ── Manejo específico según el mensaje del back ──────
        const mensaje = err?.message || '';

        if (mensaje.toLowerCase().includes('cancelada')) {
            // La reserva ya estaba cancelada — actualiza la lista para reflejar el estado real
            obtenerMisReservas();
            Swal.fire({
                title: 'Reserva ya cancelada',
                text: 'Esta reserva ya había sido cancelada anteriormente.',
                icon: 'info',
                confirmButtonColor: '#f38d1e',
                timer: 3000,
                timerProgressBar: true,
            });
        } else {
            Swal.fire({
                title: 'No se pudo cancelar',
                text: mensaje || 'Ocurrió un error inesperado. Intenta de nuevo.',
                icon: 'error',
                confirmButtonColor: '#f38d1e',
            });
        }
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
                                        onClick={() => handleCancelar(r.idD, r.tCancha, r.fInicioReserva)}
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