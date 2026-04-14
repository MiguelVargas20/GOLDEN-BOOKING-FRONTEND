import { createContext, useContext, useState } from "react";
import { loginUsuario, registrarUsuario } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  // Login
  const login = async (data) => {
    const response = await loginUsuario(data);

    // Intentar obtener el perfil completo
    let numeroDocumento = null;
    try {
        const perfilRes = await fetch(
            `${import.meta.env.VITE_API_URL}/api/usuarios/${response.id}`,
            {
                headers: {
                    "Authorization": `Bearer ${response.token}`
                }
            }
        );
        if (perfilRes.ok) {
            const perfil = await perfilRes.json();
            numeroDocumento = perfil.documento?.numeroD || null;
        }
    } catch (e) {
        console.warn("No se pudo obtener el perfil completo:", e);
    }

    const userData = {
        id: response.id,
        usuario: response.usuario,
        nombreCompleto: response.nombreCompleto,
        roles: response.roles,
        numeroDocumento: numeroDocumento,
    };

    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(response.token);
    setUser(userData);

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

  const isAdmin = () => user?.roles?.includes("ROL_ADMIN");
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