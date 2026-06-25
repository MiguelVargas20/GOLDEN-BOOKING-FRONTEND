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

  // ── LOGIN ────────────────────────────────────────────────
  const login = async (data) => {
    const response = await loginUsuario(data);

    let numeroDocumento = null;
    try {
      const perfilRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/usuarios/${response.id}`,
        {
          headers: { Authorization: `Bearer ${response.token}` }
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

  // ── LOGOUT ───────────────────────────────────────────────
  const logout = async () => {
    try {
      const savedToken = localStorage.getItem("token"); // ← clave correcta
      if (savedToken) {
        await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${savedToken}` }
        });
      }
    } catch (err) {
      console.warn("Logout remoto falló, limpiando sesión local:", err.message);
    } finally {
      localStorage.removeItem("token"); // ← clave correcta
      localStorage.removeItem("user");  // ← clave correcta
      setToken(null);
      setUser(null);
    }
  };

  // ── REGISTRO ─────────────────────────────────────────────
  const registro = async (data) => {
    return await registrarUsuario(data);
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