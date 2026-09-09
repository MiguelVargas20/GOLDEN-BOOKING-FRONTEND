import { createContext, useContext, useState, useRef } from "react";
import Swal from "sweetalert2";
import { loginUsuario, registrarUsuario, refrescarToken } from "../services/authService";

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

// ── Dónde vive la sesión ─────────────────────────────────────
// Si el usuario marcó "Recordarme": localStorage (sobrevive a cerrar el navegador).
// Si no la marcó: sessionStorage (se borra al cerrar la pestaña/navegador).
// Solo UNO de los dos tiene datos a la vez — nunca ambos.
const obtenerStorageActivo = () => {
    return localStorage.getItem("token") ? localStorage : sessionStorage;
};

const guardarSesion = (token, userData, recordarme) => {
    const storage = recordarme ? localStorage : sessionStorage;
    const otroStorage = recordarme ? sessionStorage : localStorage;
    otroStorage.removeItem("token");
    otroStorage.removeItem("user");
    storage.setItem("token", token);
    storage.setItem("user", JSON.stringify(userData));
};

const limpiarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
};

export const AuthProvider = ({ children }) => {
    const timersRef = useRef([]);
    const recordarmeRef = useRef(false);

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
                const t1 = setTimeout(async () => {
                    try {
                        // Intento silencioso: si el refresh token (cookie httpOnly)
                        // sigue vigente, renovamos el JWT sin molestar al usuario.
                        const respuesta = await refrescarToken();
                        const storage = recordarmeRef.current ? localStorage : sessionStorage;
                        storage.setItem("token", respuesta.token);
                        setToken(respuesta.token);
                        programarAlertasExpiracion(respuesta.token);
                    } catch {
                        // El refresh token también expiró (o no existe) — ahí sí avisamos.
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
                    }
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
        const storage = obtenerStorageActivo();
        const savedToken = storage.getItem("token");
        if (savedToken && !tokenEsValido(savedToken)) {
            limpiarSesion();
            return null;
        }
        if (savedToken) {
            recordarmeRef.current = storage === localStorage;
            setTimeout(() => programarAlertasExpiracion(savedToken), 0);
        }
        return savedToken || null;
    });

        const [user, setUser] = useState(() => {
        const storage = obtenerStorageActivo();
        const savedToken = storage.getItem("token");
        if (!tokenEsValido(savedToken)) return null;

        const savedUser = storage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const login = async (data, recordarme = false) => {
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

        recordarmeRef.current = recordarme;
        guardarSesion(response.token, userData, recordarme);

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
                        credentials: "include",
                        headers: { Authorization: `Bearer ${savedToken}` }
                    });
                }
            } catch {
                console.warn("El logout en el servidor falló, procediendo con limpieza local.");
            } 
            finally {
                limpiarSesion();
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