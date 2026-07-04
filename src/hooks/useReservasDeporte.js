import { useEffect, useRef, useState, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { listarReservasDeporte } from "../api/ReservaDeporteApi";

const WS_URL = import.meta.env.VITE_API_URL;

export function useReservasDeporte() {
    const [espaciosOcupados, setEspaciosOcupados] = useState([]);
    const [conectado, setConectado]               = useState(false);
    const clientRef                               = useRef(null);

    // ── Carga inicial de reservas existentes (Memorizada con useCallback) ──
    const cargarReservasExistentes = useCallback(async () => {
        try {
            const respuesta = await listarReservasDeporte();
            console.log("Datos recibidos de listarReservasDeporte():", respuesta);

            let listaReservas = [];
            if (Array.isArray(respuesta)) {
                listaReservas = respuesta;
            } else if (respuesta && Array.isArray(respuesta.contenido)) {
                listaReservas = respuesta.contenido;
            } else if (respuesta && Array.isArray(respuesta.data)) {
                listaReservas = respuesta.data;
            } else if (respuesta && Array.isArray(respuesta.content)) {
                listaReservas = respuesta.content;
            } else {
                console.warn("La respuesta de la API no contiene un formato de lista válido.");
            }

            const ocupados = listaReservas.map(r => ({
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
    }, []);

    // ── Manejo de WebSockets ───────────────────────────────────
    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS(`${WS_URL}/ws`),
            reconnectDelay: 5000,

            onConnect: () => {
                setConectado(true);
                console.log("WebSocket conectado");

                // Llamamos de forma segura a la carga inicial
                cargarReservasExistentes();

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
            if (clientRef.current) {
                clientRef.current.deactivate();
            }
        };
    }, [cargarReservasExistentes]); // Dependencia limpia y segura

    // ── Función de verificación (Blindada con useCallback) ──
    const estaOcupado = useCallback((espacioId, horaInicio) => {
        return espaciosOcupados.some(
            (e) => e.espacioId === espacioId && e.horaInicio === horaInicio
        );
    }, [espaciosOcupados]);

    return { espaciosOcupados, estaOcupado, conectado };
}