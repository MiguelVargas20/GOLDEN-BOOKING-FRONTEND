import { useState, useEffect, useCallback } from "react";
import { contarRespuestasNoVistas } from "../api/ContactoApi";
import { useAuth } from "../context/AuthContext";

const INTERVALO_POLLING_MS = 30000; // Revisa cada 30s si hay respuestas nuevas

/**
 * Hermano de useMensajesNoLeidos, pero para el lado del usuario normal:
 * cuenta cuántas respuestas del admin a SUS mensajes no ha visto todavía.
 * Solo consulta si está autenticado Y NO es admin (el admin usa la otra
 * campanita, la de la bandeja completa — evita llamadas innecesarias).
 */
export function useRespuestasNoVistas() {
  const { isAdmin, isAuthenticated } = useAuth();
  const [noVistas, setNoVistas] = useState(0);

  const consultar = useCallback(async () => {
    if (!isAuthenticated() || isAdmin()) return;
    try {
      const data = await contarRespuestasNoVistas();
      setNoVistas(data.noVistas ?? 0);
    } catch (err) {
      console.error("No se pudo consultar respuestas no vistas:", err);
    }
  }, [isAdmin, isAuthenticated]);

  useEffect(() => {
    consultar();
    const intervalo = setInterval(consultar, INTERVALO_POLLING_MS);
    return () => clearInterval(intervalo);
  }, [consultar]);

  return noVistas;
}