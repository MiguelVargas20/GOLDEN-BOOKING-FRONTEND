import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Componente RutaProteccion
export default function RutaProteccion({ children, soloAdmin = false }) {
  const { isAuthenticated, isAdmin } = useAuth();

  // Verifica si el usuario está autenticado; si no, redirige a la página de login
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Si la ruta es solo para administradores y el usuario no tiene permisos, redirige a la página de inicio
  if (soloAdmin && !isAdmin()) {
    return <Navigate to="/home" replace />;
  }

  // Si tiene children lo renderiza, si no usa Outlet para rutas anidadas
  return children ? children : <Outlet />;
}