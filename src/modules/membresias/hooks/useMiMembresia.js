import { useEffect, useState } from "react";
import { obtenerMiMembresia } from "../api/MembresiaApi";
import { useAuth } from "../../../shared/context/AuthContext";

/**
 * Membresía del cliente en sesión (descuento y días de anticipación).
 * Para el admin (reserva en recepción) no aplica: devuelve null.
 */
export function useMiMembresia() {
  const { isAdmin, isAuthenticated } = useAuth();
  const esCliente = isAuthenticated() && !isAdmin();
  const [membresia, setMembresia] = useState(null);

  useEffect(() => {
    if (!esCliente) return;
    obtenerMiMembresia().then(setMembresia).catch(() => setMembresia(null));
  }, [esCliente]);

  return membresia;
}

export const NOMBRE_MEMBRESIA = { NINGUNA: "Sin membresía", OCASIONAL: "Socio Ocasional", MIEMBRO: "Socio Miembro" };
