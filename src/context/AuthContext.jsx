import { createContext, useContext, useState } from "react";
import { loginUsuario, registrarUsuario } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(() => {
    // Recuperar sesión guardada si existe
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  // Login
  const login = async (data) => {
    const response = await loginUsuario(data);

    // Guardar token y datos del usuario
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify({
      id: response.id,
      usuario: response.usuario,
      nombreCompleto: response.nombreCompleto,
      roles: response.roles,
    }));

    setToken(response.token);
    setUser({
      id: response.id,
      usuario: response.usuario,
      nombreCompleto: response.nombreCompleto,
      roles: response.roles,
    });

    return response;
  };

  // Registro
  const registro = async (data) => {
    return await registrarUsuario(data);
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  // Verificar si es admin
  const isAdmin = () => user?.roles?.includes("ROL_ADMIN");

  // Verificar si está autenticado
  const isAuthenticated = () => !!token;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      registro,
      logout,
      isAdmin,
      isAuthenticated,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);