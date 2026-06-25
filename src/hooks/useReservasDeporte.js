import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WS_URL = import.meta.env.VITE_API_URL;

export function useReservasDeporte() {
    const [espaciosOcupados, setEspaciosOcupados] = useState([]);
    const [conectado, setConectado]               = useState(false);
    const clientRef                               = useRef(null);

    useEffect(() => {
        // Crea el cliente STOMP con SockJS como transporte
        const client = new Client({
            webSocketFactory: () => new SockJS(`${WS_URL}/ws`),
            reconnectDelay: 5000, // reintenta cada 5s si se cae la conexión

            onConnect: () => {
                setConectado(true);
                console.log("WebSocket conectado");

                // Se suscribe al canal donde el back emite eventos
                client.subscribe("/topic/reservas-deporte", (message) => {
                    const evento = JSON.parse(message.body);
                    console.log("Evento recibido:", evento);

                    setEspaciosOcupados((prev) => {
                        // Si el espacio queda DISPONIBLE, lo quitamos de la lista
                        if (evento.estado === "DISPONIBLE") {
                            return prev.filter(
                                (e) => !(e.espacioId === evento.espacioId &&
                                         e.horaInicio === evento.horaInicio)
                            );
                        }
                        // Si es OCUPADO, lo agregamos (evitando duplicados)
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

        // Limpia la conexión cuando el componente se desmonta
        return () => {
            client.deactivate();
        };
    }, []);

    // Verifica si un espacio+horario específico está ocupado
    const estaOcupado = (espacioId, horaInicio) => {
        return espaciosOcupados.some(
            (e) => e.espacioId === espacioId && e.horaInicio === horaInicio
        );
    };

    return { espaciosOcupados, estaOcupado, conectado };
}