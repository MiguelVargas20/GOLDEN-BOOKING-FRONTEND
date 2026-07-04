import { useState, useEffect, useCallback } from "react";
import { contarMensajesNoLeidos } from "../api/ContactoApi";
import { useAuth } from "../context/AuthContext";

const INTERVALO_POLLING_MS = 30000; // Revisa cada 30s si hay mensajes nuevos

/**
 * Hook para el badge de mensajes sin leer del Navbar.
 * Solo consulta si el usuario está autenticado Y es admin (evita llamadas
 * innecesarias — y evita un 403 silencioso — para usuarios normales).
 */
export function useMensajesNoLeidos() {
  const { isAdmin, isAuthenticated } = useAuth();
  const [noLeidos, setNoLeidos] = useState(0);

  const consultar = useCallback(async () => {
    if (!isAuthenticated() || !isAdmin()) return;
    try {
      const data = await contarMensajesNoLeidos();
      setNoLeidos(data.noLeidos ?? 0);
    } catch (err) {
      console.error("No se pudo consultar mensajes no leídos:", err);
    }
  }, [isAdmin, isAuthenticated]);

  useEffect(() => {
    consultar();
    const intervalo = setInterval(consultar, INTERVALO_POLLING_MS);
    return () => clearInterval(intervalo);
  }, [consultar]);

  return noLeidos;
}