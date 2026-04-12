import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RutaProteccion({ children, soloAdmin = false }) {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (soloAdmin && !isAdmin()) {
    return <Navigate to="/home" replace />;
  }

  // Si tiene children lo renderiza, si no usa Outlet para rutas anidadas
  return children ? children : <Outlet />;
}