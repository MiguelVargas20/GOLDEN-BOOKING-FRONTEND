import { useCallback, useEffect, useState } from "react";
import { contarNotificacionesNoLeidas, listarNotificaciones, marcarNotificacionLeida, marcarTodasLeidas } from "../api/NotificacionApi";
import { useAuth } from "../../../shared/context/AuthContext";

const INTERVALO_POLLING_MS = 30000; // cada 30 s, igual que la campana de mensajes

/**
 * Notificaciones del cliente sobre sus reservas (aprobada, cancelada,
 * reprogramada, vencida, calificar). Solo consulta si hay un CLIENTE en
 * sesión; también se refresca al volver a la pestaña.
 */
export function useNotificaciones() {
  const { isAdmin, isAuthenticated } = useAuth();
  const esCliente = isAuthenticated() && !isAdmin();
  const [noLeidas, setNoLeidas] = useState(0);
  const [lista, setLista] = useState([]);

  const contar = useCallback(async () => {
    try {
      setNoLeidas(await contarNotificacionesNoLeidas());
    } catch {
      // la campana es un extra: si falla se intenta en la próxima vuelta
    }
  }, []);

  useEffect(() => {
    if (!esCliente) return undefined;
    const primera = setTimeout(contar, 0);
    const intervalo = setInterval(contar, INTERVALO_POLLING_MS);
    const alVolver = () => { if (document.visibilityState === "visible") contar(); };
    document.addEventListener("visibilitychange", alVolver);
    return () => {
      clearTimeout(primera);
      clearInterval(intervalo);
      document.removeEventListener("visibilitychange", alVolver);
    };
  }, [esCliente, contar]);

  const cargarLista = useCallback(async () => {
    try {
      setLista(await listarNotificaciones());
    } catch {
      setLista([]);
    }
  }, []);

  const marcarLeida = useCallback(async (n) => {
    if (n.leida) return;
    setLista((l) => l.map((x) => (x.id === n.id ? { ...x, leida: true } : x)));
    setNoLeidas((c) => Math.max(0, c - 1));
    try { await marcarNotificacionLeida(n.id); } catch { contar(); }
  }, [contar]);

  const marcarTodas = useCallback(async () => {
    setLista((l) => l.map((x) => ({ ...x, leida: true })));
    setNoLeidas(0);
    try { await marcarTodasLeidas(); } catch { contar(); }
  }, [contar]);

  return { noLeidas: esCliente ? noLeidas : 0, lista, cargarLista, marcarLeida, marcarTodas };
}
