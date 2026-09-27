import { useEffect, useRef, useState, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { obtenerFechasOcupadasDeporte } from "../api/ReservaDeporteApi";
import { API_URL } from "../../../shared/api/apiUtils";

const WS_URL = API_URL;

/**
 * Horarios ocupados de los espacios deportivos, en vivo.
 *
 * - Carga inicial: GET /api/reservas/deporte/ocupadas (reservas no canceladas
 *   que aún no terminan).
 * - En vivo: WebSocket /topic/reservas-deporte avisa cuando alguien reserva
 *   ("OCUPADO") o cancela ("DISPONIBLE").
 *
 * Cada horario ocupado es { espacioId, inicio: Date, fin: Date }.
 * Antes se comparaba la hora de inicio como TEXTO exacto ("10:00" vs
 * "10:00:00" no coincidían) y por nombre de cancha: una reserva de 10 a 12 no
 * bloqueaba un intento de 11 a 13. Ahora se detecta cualquier cruce de rangos
 * y por el id real del espacio.
 */
export function useReservasDeporte() {
  const [ocupados, setOcupados] = useState([]);
  const [conectado, setConectado] = useState(false);
  const clientRef = useRef(null);

  const cargarOcupados = useCallback(async () => {
    try {
      const lista = await obtenerFechasOcupadasDeporte();
      setOcupados(lista.map((r) => ({ espacioId: r.espacioId, inicio: new Date(r.inicio), fin: new Date(r.fin) })));
    } catch (err) {
      console.warn("No se pudieron cargar los horarios ocupados:", err.message);
    }
  }, []);

  // Los horarios ocupados se cargan al abrir la pantalla, sin esperar al
  // WebSocket: si el canal en vivo no conecta (proxy, HTTPS → HTTP), antes el
  // cliente nunca veía las horas ocupadas.
  useEffect(() => {
    const primera = setTimeout(cargarOcupados, 0);
    return () => clearTimeout(primera);
  }, [cargarOcupados]);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(`${WS_URL}/ws`),
      reconnectDelay: 5000,
      onConnect: () => {
        setConectado(true);
        cargarOcupados();
        client.subscribe("/topic/reservas-deporte", (message) => {
          const evento = JSON.parse(message.body);
          const rango = { espacioId: evento.espacioId, inicio: new Date(evento.horaInicio), fin: new Date(evento.horaFin) };
          const mismo = (o) => o.espacioId === rango.espacioId && o.inicio.getTime() === rango.inicio.getTime();

          setOcupados((prev) => {
            if (evento.estado === "DISPONIBLE") return prev.filter((o) => !mismo(o));
            return prev.some(mismo) ? prev : [...prev, rango];
          });
        });
      },
      onDisconnect: () => setConectado(false),
      onWebSocketClose: () => setConectado(false),
      onStompError: (frame) => console.error("Error STOMP:", frame),
    });

    client.activate();
    clientRef.current = client;
    return () => clientRef.current?.deactivate();
  }, [cargarOcupados]);

  /** ¿El rango [inicio, fin) se cruza con alguna reserva de ese espacio? */
  const estaOcupado = useCallback((espacioId, inicio, fin) => {
    if (!espacioId || !inicio || !fin) return false;
    return ocupados.some((o) => o.espacioId === espacioId && inicio < o.fin && fin > o.inicio);
  }, [ocupados]);

  /** Reservas de ese espacio en ese día (para mostrarlas al elegir horario). */
  const ocupadosDelDia = useCallback((espacioId, dia) => {
    if (!espacioId || !dia) return [];
    return ocupados
      .filter((o) => o.espacioId === espacioId && o.inicio.toDateString() === dia.toDateString())
      .sort((a, b) => a.inicio - b.inicio);
  }, [ocupados]);

  return { estaOcupado, ocupadosDelDia, conectado };
}
