import { useEffect, useRef, useState, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { obtenerFechasOcupadasDeporte } from "../api/ReservaDeporteApi";

const WS_URL = import.meta.env.VITE_API_URL;

export function useReservasDeporte() {
    const [espaciosOcupados, setEspaciosOcupados] = useState([]);
    const [conectado, setConectado]               = useState(false);
    const clientRef                               = useRef(null);

    // ── Carga inicial de reservas existentes (Memorizada con useCallback) ──
    // FIX: antes llamaba a listarReservasDeporte() (GET /api/reservas/deporte),
    // que en el backend es admin-only. Para un CLIENTE normal esa llamada
    // devolvía 403, el catch de abajo se tragaba el error, y el calendario
    // de disponibilidad arrancaba siempre vacío: el cliente solo se enteraba
    // de un conflicto si otra persona reservaba mientras tenía la página
    // abierta (vía WebSocket), nunca de las reservas que ya existían antes.
    // Ahora usa GET /api/reservas/deporte/ocupadas, accesible para ADMIN o
    // CLIENTE y sin datos del dueño, que además ya viene en el formato que
    // este hook necesita (sin adivinar la forma de la respuesta).
    const cargarReservasExistentes = useCallback(async () => {
        try {
            const ocupadas = await obtenerFechasOcupadasDeporte();

            const ocupados = ocupadas.map(r => ({
                espacioId:  r.tipoCancha,
                fecha:      r.inicio?.split('T')[0],
                horaInicio: r.inicio,
                horaFin:    r.fin,
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

                // Llamamos de forma segura a la carga inicial
                cargarReservasExistentes();

                client.subscribe("/topic/reservas-deporte", (message) => {
                    const evento = JSON.parse(message.body);

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