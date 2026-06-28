import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { listarReservasDeporte } from "../api/ReservaDeporteApi";

const WS_URL = import.meta.env.VITE_API_URL;

export function useReservasDeporte() {
    const [espaciosOcupados, setEspaciosOcupados] = useState([]);
    const [conectado, setConectado]               = useState(false);
    const clientRef                               = useRef(null);

    // ── Carga inicial de reservas existentes en MongoDB ──────
    const cargarReservasExistentes = async () => {
        try {
            const reservas = await listarReservasDeporte();
            // Convierte las reservas existentes al mismo formato
            // que usan los eventos WebSocket
            const ocupados = reservas.map(r => ({
                espacioId:  r.tipoCancha,
                fecha:      r.fechaReserva?.split('T')[0],
                horaInicio: r.fechaReserva,
                horaFin:    r.fechaFinReserva,
                estado:     "OCUPADO",
                mensaje:    `La cancha ${r.tipoCancha} ya está reservada.`
            }));
            setEspaciosOcupados(ocupados);
        } catch (err) {
            console.warn("No se pudieron cargar reservas existentes:", err.message);
        }
    };
    // ─────────────────────────────────────────────────────────

    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS(`${WS_URL}/ws`),
            reconnectDelay: 5000,

            onConnect: () => {
                setConectado(true);
                console.log("WebSocket conectado");

                // ── Carga reservas existentes al conectar ────
                cargarReservasExistentes();
                // ────────────────────────────────────────────

                client.subscribe("/topic/reservas-deporte", (message) => {
                    const evento = JSON.parse(message.body);
                    console.log("Evento recibido:", evento);

                    setEspaciosOcupados((prev) => {
                        if (evento.estado === "DISPONIBLE") {
                            return prev.filter(
                                (e) => !(e.espacioId === evento.espacioId &&
                                         e.horaInicio === evento.horaInicio)
                            );
                        }
                        const yaExiste = prev.some(
                            (e) => e.espacioId === evento.espacioId &&
                                   e.horaInicio === evento.horaInicio
                        );
                        return yaExiste ? prev : [...prev, evento];
                    });
                });
            },

            onDisconnect: () => {
                setConectado(false);
                console.log("WebSocket desconectado");
            },

            onStompError: (frame) => {
                console.error("Error STOMP:", frame);
            }
        });

        client.activate();
        clientRef.current = client;

        return () => {
            client.deactivate();
        };
    }, []);

    const estaOcupado = (espacioId, horaInicio) => {
        return espaciosOcupados.some(
            (e) => e.espacioId === espacioId && e.horaInicio === horaInicio
        );
    };

    return { espaciosOcupados, estaOcupado, conectado };
}