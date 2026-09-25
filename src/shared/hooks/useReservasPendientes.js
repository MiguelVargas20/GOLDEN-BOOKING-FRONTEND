import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { obtenerResumenDeporte } from "../../modules/reservasDeportivas/api/ReservaDeporteApi";
import { obtenerResumenHotel } from "../../modules/reservasHoteleras/api/ReservaHotelApi";
import { EVENTO_RESERVAS_CAMBIARON } from "./eventosReservas";

const INTERVALO_POLLING_MS = 60000; // cada minuto

/**
 * Cantidad de reservas PENDIENTES de aprobación (hotel y deporte), para los
 * contadores del Navbar del ADMIN. Para clientes no hace ninguna llamada.
 *
 * @returns {{ deporte: number, hotel: number }}
 */
export function useReservasPendientes() {
  const { isAdmin, isAuthenticated } = useAuth();
  // Booleano (no las funciones del contexto, que cambian en cada render):
  // así el intervalo solo se reinicia si realmente cambia el rol/sesión.
  const esAdmin = isAuthenticated() && isAdmin();
  const [pendientes, setPendientes] = useState({ deporte: 0, hotel: 0 });

  useEffect(() => {
    if (!esAdmin) return undefined;
    let activo = true;

    const consultar = async () => {
      try {
        const [deporte, hotel] = await Promise.all([obtenerResumenDeporte(), obtenerResumenHotel()]);
        if (activo) setPendientes({ deporte: deporte.PENDIENTE ?? 0, hotel: hotel.PENDIENTE ?? 0 });
      } catch (err) {
        console.warn("No se pudo consultar las reservas pendientes:", err.message);
      }
    };

    consultar();
    const intervalo = setInterval(consultar, INTERVALO_POLLING_MS);
    // Al instante cuando llega un aviso en vivo o se aprueba/cancela una reserva
    window.addEventListener(EVENTO_RESERVAS_CAMBIARON, consultar);
    return () => {
      activo = false;
      clearInterval(intervalo);
      window.removeEventListener(EVENTO_RESERVAS_CAMBIARON, consultar);
    };
  }, [esAdmin]);

  return esAdmin ? pendientes : { deporte: 0, hotel: 0 };
}
