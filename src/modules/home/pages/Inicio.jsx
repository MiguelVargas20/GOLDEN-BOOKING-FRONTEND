import { useAuth } from "../../../shared/context/AuthContext";
import Home from "./Home";
import DashboardAdmin from "../../dashboard/pages/DashboardAdmin";

/**
 * Página de Inicio según el rol: el ADMIN ve su panel de control
 * (dashboard) y el cliente la portada con los servicios.
 */
export default function Inicio() {
  const { isAdmin } = useAuth();
  return isAdmin() ? <DashboardAdmin /> : <Home />;
}
