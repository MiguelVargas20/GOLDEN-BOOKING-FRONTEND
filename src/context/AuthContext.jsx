import { createContext, useContext, useState, useRef } from "react";

import Swal from "sweetalert2";
import { loginUsuario, registrarUsuario } from "../services/authService";

const AuthContext = createContext();

// Función auxiliar — va FUERA del componente, antes del AuthProvider
const tokenEsValido = (token) => {
  if (!token) return false;
  try {
    // El JWT tiene 3 partes separadas por puntos: header.payload.signature
    // El payload es la parte del medio, codificada en base64
    const payload = JSON.parse(atob(token.split('.')[1]));
    // exp está en segundos, Date.now() en milisegundos
    return payload.exp * 1000 > Date.now();
  } catch {
    return false; // token malformado
  }
};

export const AuthProvider = ({ children }) => {
  // 1. Inicializamos el Token (y limpiamos si ya expiró)
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken && !tokenEsValido(savedToken)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return null;
    }
        // ── Programa alertas para token existente ────────
    if (savedToken) {
        // setTimeout 0 para que React monte el componente primero
        setTimeout(() => programarAlertasExpiracion(savedToken), 0);
    }
    return savedToken || null;
});

  // 2. Inicializamos el Usuario (solo si el token sigue siendo válido)
  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem("token");
    if (!tokenEsValido(savedToken)) return null;
    
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
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
    programarAlertasExpiracion(response.token);

    return response;
  };

  //FUNCION PARA CIERRE SESON CON ALERTA Y REDIRECCIONAMIENTO A LOGIN
      // ── Temporizadores de sesión ─────────────────────────────
    const timersRef = useRef([]);  // guarda los timeouts para limpiarlos al logout

    const limpiarTimers = () => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
    };

    const programarAlertasExpiracion = (token) => {
        limpiarTimers();

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expMs = payload.exp * 1000;          // expiración en ms
            const ahora = Date.now();
            const tiempoRestante = expMs - ahora;      // ms hasta que expire

            if (tiempoRestante <= 0) return;           // ya expiró

            // ── Aviso 5 minutos antes ────────────────────────
            const tiempoAviso = tiempoRestante - 5 * 60 * 1000;
            if (tiempoAviso > 0) {
                const t1 = setTimeout(() => {
                    Swal.fire({
                        title: '⏰ Sesión por expirar',
                        text: 'Tu sesión expira en 5 minutos. Guarda tu trabajo.',
                        icon: 'warning',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: true,
                        confirmButtonText: 'Entendido',
                        confirmButtonColor: '#f38d1e',
                        timer: 60000,         // desaparece solo después de 1 minuto
                        timerProgressBar: true,
                    });
                }, tiempoAviso);
                timersRef.current.push(t1);
            }

            // ── Logout automático al expirar ─────────────────
            const t2 = setTimeout(async () => {
                await Swal.fire({
                    title: 'Sesión expirada',
                    text: 'Tu sesión ha terminado. Por favor inicia sesión nuevamente.',
                    icon: 'info',
                    confirmButtonText: 'Ir al login',
                    confirmButtonColor: '#f38d1e',
                    allowOutsideClick: false,   // obliga a hacer clic en el botón
                });
                logout();
            }, tiempoRestante);
            timersRef.current.push(t2);

        } catch {
            console.warn("No se pudo programar alerta de expiración");
        }
    };
  // ── LOGOUT ───────────────────────────────────────────────
  const logout = async () => {

    limpiarTimers();
    
    try {
      const savedToken = localStorage.getItem("token"); 
      if (savedToken) {
        await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${savedToken}` }
        });
      }
    } catch (err) {
      console.warn("Logout remoto falló, limpiando sesión local:", err.message);
    } finally {
      localStorage.removeItem("token"); 
      localStorage.removeItem("user");  
      setToken(null);
      setUser(null);
    }
  };

  // ── REGISTRO ─────────────────────────────────────────────
  const registro = async (data) => {
    return await registrarUsuario(data);
  };

  // Modificado para usar la función tokenEsValido en tiempo real si lo deseas, 
  // o simplemente evaluar si existe el token en el estado.
  const isAdmin = () => user?.roles?.includes("ROL_ADMIN");
  const isAuthenticated = () => !!token && tokenEsValido(token);

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