import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { listarMisReservasHotel, cancelarReservaHotel } from "../api/ReservaHotelApi";
import Swal from "sweetalert2";
import { Spinner } from "react-bootstrap";

export default function MisReservasHotel() {
    const { user } = useAuth();
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { obtenerReservas(); }, []);

    const obtenerReservas = async () => {
        try {
            const docUsuario = user?.numeroDocumento;
            if (!docUsuario) {
                setLoading(false);
                return;
            }
            const data = await listarMisReservasHotel(docUsuario);
            setReservas(data);
        } catch (err) {
            Swal.fire({ title: "Error", text: "No se pudieron cargar tus reservas.", icon: "error", confirmButtonColor: "#f38d1e" });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelar = async (id, numeroHab) => {
        const resultado = await Swal.fire({
            title: "¿Cancelar reserva?",
            html: `<p>La reserva de la habitación <strong>${numeroHab}</strong> será cancelada.</p>`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, cancelar",
            cancelButtonText: "Mantener",
            confirmButtonColor: "#e53e3e",
            cancelButtonColor: "#6c757d",
        });

        if (!resultado.isConfirmed) return;

        try {
            await cancelarReservaHotel(id);
            await Swal.fire({
                title: "¡Cancelada!",
                text: "Tu reserva fue cancelada correctamente.",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
            });
            obtenerReservas();
        } catch (err) {
            const mensaje = err?.message || "";
            if (mensaje.toLowerCase().includes("cancelada")) {
                Swal.fire({ title: "Ya cancelada", text: "Esta reserva ya había sido cancelada.", icon: "info", confirmButtonColor: "#f38d1e" });
                obtenerReservas();
            } else {
                Swal.fire({ title: "Error", text: "No se pudo cancelar la reserva.", icon: "error", confirmButtonColor: "#f38d1e" });
            }
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
            <Spinner style={{ color: "#f38d1e" }} />
        </div>
    );

    return (
        <div style={{ padding: "2rem" }}>
            <h1 style={{ fontFamily: '"Bungee", sans-serif', color: "#1a1a2e", fontSize: "2rem", marginBottom: "1.5rem" }}>
                MIS RESERVAS <span style={{ color: "#f38d1e" }}>HOTELERAS</span>
            </h1>

            {reservas.length === 0 ? (
                <div className="text-center py-5 text-muted">
                    <p>No tienes reservas hoteleras aún.</p>
                </div>
            ) : (
                <div style={{ overflowX: "auto" }}>
                    <table className="table table-hover" style={{ fontSize: "0.9rem" }}>
                        <thead>
                            <tr style={{ background: "#1a1a2e", color: "#fff" }}>
                                <th style={{ padding: "1rem" }}>Habitación</th>
                                <th style={{ padding: "1rem" }}>Tipo</th>
                                <th style={{ padding: "1rem" }}>Check-in</th>
                                <th style={{ padding: "1rem" }}>Check-out</th>
                                <th style={{ padding: "1rem" }}>Noches</th>
                                <th style={{ padding: "1rem" }}>Total</th>
                                <th style={{ padding: "1rem" }}>Estado</th>
                                <th style={{ padding: "1rem" }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservas.map((r) => (
                                <tr key={r.idH}>
                                    <td style={{ padding: "1rem" }}>{r.numeroHabitacion || "—"}</td>
                                    <td style={{ padding: "1rem" }}>{r.tHabitacion || "—"}</td>
                                    <td style={{ padding: "1rem" }}>
                                        {r.fCheckIn ? new Date(r.fCheckIn).toLocaleDateString() : "—"}
                                    </td>
                                    <td style={{ padding: "1rem" }}>
                                        {r.fCheckOut ? new Date(r.fCheckOut).toLocaleDateString() : "—"}
                                    </td>
                                    <td style={{ padding: "1rem" }}>{r.noch ?? "—"}</td>
                                    <td style={{ padding: "1rem", fontWeight: 700, color: "#f38d1e" }}>
                                        ${r.pTotal?.toLocaleString("es-CO") || 0}
                                    </td>
                                    <td style={{ padding: "1rem" }}>
                                        <span className={`badge ${r.estado === "CANCELADA" ? "bg-danger" : "bg-success"}`}>
                                            {r.estado || "PENDIENTE"}
                                        </span>
                                    </td>
                                    <td style={{ padding: "1rem" }}>
                                        <button
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => handleCancelar(r.idH, r.numeroHabitacion)}
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
        </div>
    );
}