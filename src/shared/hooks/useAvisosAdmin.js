import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import Swal from "sweetalert2";
import { API_URL, authHeaderToken } from "../api/apiUtils";
import { useAuth } from "../context/AuthContext";
import { avisarReservasCambiaron } from "./eventosReservas";
import { fechaHora, fecha } from "../utils/formato";

const TOPICO = "/topic/admin/reservas";

/** Texto del aviso según la categoría y la acción. */
function describir(aviso) {
  const cuando = aviso.categoria === "DEPORTE"
    ? fechaHora(aviso.inicio)
    : `${fecha(aviso.inicio)} → ${fecha(aviso.fin)}`;
  return aviso.accion === "NUEVA"
    ? { titulo: "Nueva solicitud de reserva", texto: `${aviso.cliente} · ${aviso.lugar} · ${cuando}`, icono: "info" }
    : { titulo: "Un cliente canceló su reserva", texto: `${aviso.cliente} · ${aviso.lugar} · ${cuando}`, icono: "warning" };
}

/**
 * Avisos en vivo para el ADMIN: cuando un cliente crea o cancela una reserva
 * muestra una notificación (clic → ir a gestionar) y dispara el evento
 * "reservas cambiaron" para que la Navbar y el dashboard se actualicen solos.
 *
 * El canal está protegido en el backend: se conecta enviando el JWT y solo un
 * ADMIN puede suscribirse. Para clientes no abre ninguna conexión.
 */
export function useAvisosAdmin() {
  const { isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const esAdmin = isAuthenticated() && isAdmin();

  useEffect(() => {
    if (!esAdmin || !API_URL) return undefined;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_URL}/ws`),
      reconnectDelay: 10000,
      // Token fresco en cada (re)conexión: puede haberse renovado mientras tanto
      beforeConnect: () => { client.connectHeaders = authHeaderToken(); },
      onConnect: () => {
        client.subscribe(TOPICO, (mensaje) => {
          let aviso;
          try { aviso = JSON.parse(mensaje.body); } catch { return; }
          avisarReservasCambiaron(aviso);

          const { titulo, texto, icono } = describir(aviso);
          const ruta = aviso.categoria === "DEPORTE" ? "/reservas-deportivas/gestionar" : "/reservas-hoteleras/gestionar";
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: icono,
            title: titulo,
            text: texto,
            showConfirmButton: true,
            confirmButtonText: "Ver",
            confirmButtonColor: "#f38d1e",
            showCloseButton: true,
            timer: 9000,
            timerProgressBar: true,
          }).then(({ isConfirmed }) => { if (isConfirmed) navigate(ruta); });
        });
      },
      onStompError: (frame) => console.warn("Avisos en vivo no disponibles:", frame.headers?.message),
    });

    client.activate();
    return () => { client.deactivate(); };
  }, [esAdmin, navigate]);
}
