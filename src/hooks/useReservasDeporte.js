import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { listarReservasDeporte } from "../api/ReservaDeporteApi";

const WS_URL = import.meta.env.VITE_API_URL;

// Hook personalizado para gestionar reservas de deporte en tiempo real mediante WebSockets.
export function useReservasDeporte() {
    const [espaciosOcupados, setEspaciosOcupados] = useState([]);
    const [conectado, setConectado]               = useState(false);
    const clientRef                               = useRef(null);

    // ── Carga inicial de reservas existentes en MongoDB ──────
    const cargarReservasExistentes = async () => {
        try {
            // Llamada a la API para obtener todas las reservas existentes
            const respuesta = await listarReservasDeporte();

            // 🔍 Agregamos este log temporal para que veas en la consola la estructura exacta de tu backend
            console.log("Datos recibidos de listarReservasDeporte():", respuesta);

            // 🛡️ SOLUCIÓN DEFINITIVA: Validamos dónde viene realmente el Array
            let listaReservas = [];
            if (Array.isArray(respuesta)) {
                listaReservas = respuesta; // Si viene el array directo
            } else if (respuesta && Array.isArray(respuesta.contenido)) {
                listaReservas = respuesta.contenido; // 👈 SOLUCIÓN: Si viene paginado en español (.contenido)
            } else if (respuesta && Array.isArray(respuesta.data)) {
                listaReservas = respuesta.data; // Si viene envuelto en Axios (.data)
            } else if (respuesta && Array.isArray(respuesta.content)) {
                listaReservas = respuesta.content; // Si viene paginado de Spring Boot (.content)
            } else {
                console.warn("La respuesta de la API no contiene un formato de lista válido.");
            }

            // Convierte las reservas existentes al mismo formato que usan los eventos WebSocket
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
    };
    // ─────────────────────────────────────────────────────────

    // ... (El resto de tu código de WebSockets permanece exactamente igual y sin cambios)
    useEffect(() => {
        // Configuración del cliente STOMP sobre SockJS
        const client = new Client({
            webSocketFactory: () => new SockJS(`${WS_URL}/ws`),
            reconnectDelay: 5000,

            // ── Manejo de eventos de conexión y desconexión ───────
            onConnect: () => {
                setConectado(true);
                console.log("WebSocket conectado");

                // ── Carga reservas existentes al conectar ────
                cargarReservasExistentes();
                // ────────────────────────────────────────────

                // Suscripción al tópico de reservas de deporte
                client.subscribe("/topic/reservas-deporte", (message) => {
                    const evento = JSON.parse(message.body);
                    console.log("Evento recibido:", evento);

                    // Actualiza el estado de espacios ocupados según el evento recibido
                    setEspaciosOcupados((prev) => {
                        if (evento.estado === "DISPONIBLE") {
                            return prev.filter(
                                (e) => !(e.espacioId === evento.espacioId &&
                                         e.horaInicio === evento.horaInicio)
                            );
                        }

                        // Evita duplicados: Solo agrega si no existe ya en el estado
                        const yaExiste = prev.some(
                            (e) => e.espacioId === evento.espacioId &&
                                   e.horaInicio === evento.horaInicio
                        );
                        return yaExiste ? prev : [...prev, evento];
                    });
                });
            },

            // ── Manejo de eventos de conexión y errores ───────
            onDisconnect: () => {
                setConectado(false);
                console.log("WebSocket desconectado");
            },

            // Manejo de errores de conexión
            onStompError: (frame) => {
                console.error("Error STOMP:", frame);
            }
        });

        // Activación del cliente STOMP
        client.activate();
        clientRef.current = client;

        return () => {
            client.deactivate();
        };
    }, []);

    // Función para verificar si un espacio está ocupado en una hora específica
    const estaOcupado = (espacioId, horaInicio) => {
        return espaciosOcupados.some(
            (e) => e.espacioId === espacioId && e.horaInicio === horaInicio
        );
    };

    // Retorna el estado de espacios ocupados, la función de verificación y el estado de conexión
    return { espaciosOcupados, estaOcupado, conectado };
}