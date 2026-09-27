import { useState, useEffect } from "react";
import { contarRespuestasNoVistas } from "../api/ContactoApi";
import { useAuth } from "../../../shared/context/AuthContext";

const INTERVALO_POLLING_MS = 30000; // Revisa cada 30s si hay respuestas nuevas

/**
 * Hermano de useMensajesNoLeidos, pero para el lado del usuario normal:
 * cuenta cuántas respuestas del admin a SUS mensajes no ha visto todavía.
 * Solo consulta si está autenticado Y NO es admin (el admin usa la otra
 * campanita, la de la bandeja completa — evita llamadas innecesarias).
 */
export function useRespuestasNoVistas() {
  const { isAdmin, isAuthenticated } = useAuth();
  // Booleano en vez de las funciones del contexto (ver useMensajesNoLeidos)
  const esCliente = isAuthenticated() && !isAdmin();
  const [noVistas, setNoVistas] = useState(0);

  useEffect(() => {
    if (!esCliente) return undefined;
    let activo = true;

    const consultar = async () => {
      try {
        const data = await contarRespuestasNoVistas();
        if (activo) setNoVistas(data.noVistas ?? 0);
      } catch (err) {
        console.error("No se pudo consultar respuestas no vistas:", err);
      }
    };

    consultar();
    const intervalo = setInterval(consultar, INTERVALO_POLLING_MS);
    return () => { activo = false; clearInterval(intervalo); };
  }, [esCliente]);

  return esCliente ? noVistas : 0;
}
