import { createContext, useContext, useState, useRef } from "react";
import Swal from "sweetalert2";
import { loginUsuario, registrarUsuario } from "../services/authService";

const AuthContext = createContext();

// Evaluador interno (No se exporta para no romper Fast Refresh)
const tokenEsValido = (token) => {
    if (!token) return false;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
};

export const AuthProvider = ({ children }) => {
    const timersRef = useRef([]);

    const limpiarTimers = () => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
    };

    const programarAlertasExpiracion = (token) => {
        limpiarTimers();

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expMs = payload.exp * 1000;
            const ahora = Date.now();
            const tiempoRestante = expMs - ahora;

            if (tiempoRestante <= 0) return; 

            const tiempoAviso = tiempoRestante - 5 * 60 * 1000;
            if (tiempoAviso > 0) {
                const t1 = setTimeout(() => {
                    Swal.fire({
                        title: '⏰ Sesión por expirar',
                        text: 'Tu sesión expira en 5 minutes. Guarda tu trabajo.',
                        icon: 'warning',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: true,
                        confirmButtonText: 'Entendido',
                        confirmButtonColor: '#f38d1e',
                        timer: 60000, 
                        timerProgressBar: true,
                    });
                }, tiempoAviso);
                timersRef.current.push(t1);
            }

            const t2 = setTimeout(async () => {
                await Swal.fire({
                    title: 'Sesión expirada',
                    text: 'Tu sesión ha terminado. Por favor inicia sesión nuevamente.',
                    icon: 'info',
                    confirmButtonText: 'Ir al login',
                    confirmButtonColor: '#f38d1e',
                    allowOutsideClick: false, 
                });
                logout();
            }, tiempoRestante);
            timersRef.current.push(t2);

        } catch {
            console.warn("No se pudo programar la alerta de expiración.");
        }
    };

    const [token, setToken] = useState(() => {
        const savedToken = localStorage.getItem("token");
        if (savedToken && !tokenEsValido(savedToken)) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            return null;
        }
        if (savedToken) {
            setTimeout(() => programarAlertasExpiracion(savedToken), 0);
        }
        return savedToken || null;
    });

    const [user, setUser] = useState(() => {
        const savedToken = localStorage.getItem("token");
        if (!tokenEsValido(savedToken)) return null;
        
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const login = async (data) => {
        const response = await loginUsuario(data);
        let numeroDocumento = null;
        let tipoDocumento = null;

        try {
            const perfilRes = await fetch(
                `${import.meta.env.VITE_API_URL}/api/usuarios/perfil/${response.id}`,
                {
                    headers: { Authorization: `Bearer ${response.token}` }
                }
            );
            if (perfilRes.ok) {
                const perfil = await perfilRes.json();
                console.log("PERFIL CRUDO DEL BACKEND:", perfil);
                numeroDocumento = perfil.documento?.numeroD || null;
                tipoDocumento = perfil.documento?.tipoD || null;
            } else {
                console.warn("No se pudo obtener perfil al loguear. Status:", perfilRes.status);
            }
        } catch (e) {
            console.warn("No se pudo obtener el perfil completo:", e);
        }

        const userData = {
            id: response.id,
            usuario: response.usuario,
            nombreCompleto: response.nombreCompleto,
            roles: response.roles,
            documento: {
                tipo: tipoDocumento || "",
                numero: numeroDocumento || ""
            }
        };

        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(userData));
        
        setToken(response.token);
        setUser(userData);
        programarAlertasExpiracion(response.token);

        return response;
    };

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
        } catch {
            console.warn("El logout en el servidor falló, procediendo con limpieza local.");
        } 
        finally {
            localStorage.removeItem("token"); 
            localStorage.removeItem("user");  
            setToken(null);
            setUser(null);
        }
    };

    const registro = async (data) => {
        return await registrarUsuario(data);
    };

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