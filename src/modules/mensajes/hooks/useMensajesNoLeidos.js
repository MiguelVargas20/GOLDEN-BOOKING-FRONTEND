import { useState, useEffect } from "react";
import { contarMensajesNoLeidos } from "../api/ContactoApi";
import { useAuth } from "../../../shared/context/AuthContext";

const INTERVALO_POLLING_MS = 30000; // Revisa cada 30s si hay mensajes nuevos

/**
 * Hook para el badge de mensajes sin leer del Navbar.
 * Solo consulta si el usuario está autenticado Y es admin (evita llamadas
 * innecesarias — y evita un 403 silencioso — para usuarios normales).
 */
export function useMensajesNoLeidos() {
  const { isAdmin, isAuthenticated } = useAuth();
  // Se depende de un booleano y no de las funciones del contexto: esas se
  // recrean en cada render, y antes eso reiniciaba el efecto (y hacía una
  // consulta nueva) en CADA render en vez de cada 30 segundos.
  const esAdmin = isAuthenticated() && isAdmin();
  const [noLeidos, setNoLeidos] = useState(0);

  useEffect(() => {
    if (!esAdmin) return undefined;
    let activo = true;

    const consultar = async () => {
      try {
        const data = await contarMensajesNoLeidos();
        if (activo) setNoLeidos(data.noLeidos ?? 0);
      } catch (err) {
        console.error("No se pudo consultar mensajes no leídos:", err);
      }
    };

    consultar();
    const intervalo = setInterval(consultar, INTERVALO_POLLING_MS);
    return () => { activo = false; clearInterval(intervalo); };
  }, [esAdmin]);

  return esAdmin ? noLeidos : 0;
}
