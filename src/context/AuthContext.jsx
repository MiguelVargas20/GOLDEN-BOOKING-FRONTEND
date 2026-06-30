import { createContext, useContext, useState, useRef } from "react";
import Swal from "sweetalert2";
import { loginUsuario, registrarUsuario } from "../services/authService";

const AuthContext = createContext();

/**
 * Función auxiliar externa para validar la vigencia de un JWT (JSON Web Token).
 * Se ubica fuera del componente para evitar recreaciones en memoria en cada renderizado.
 * @param {string} token - El JWT a evaluar.
 * @returns {boolean} True si el token contiene un formato válido y no ha expirado.
 */
const tokenEsValido = (token) => {
    // Retorna falso si no hay token.
    if (!token) return false;
    try {
        // Un JWT consta de: header.payload.signature. El payload está codificado en Base64.
        const payload = JSON.parse(atob(token.split('.')[1]));
        // 'exp' está expresado en segundos; se multiplica por 1000 para equiparar a Date.now() en ms.
        return payload.exp * 1000 > Date.now();
    } catch {
        return false; // Retorna falso si el token está malformado.
    }
};

// ==========================================
// PROVIDER DE AUTENTICACIÓN
// ==========================================
export const AuthProvider = ({ children }) => {
    // Referencia para almacenar los identificadores de los temporizadores activos (evita re-renders).
    const timersRef = useRef([]);

    // ==========================================
    // MANEJADORES DE TEMPORIZADORES (SESIÓN)
    // ==========================================

    /**
     * Limpia todos los temporizadores (timeouts) activos de la cola.
     */
    const limpiarTimers = () => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
    };

    /**
     * Programa notificaciones visuales y el cierre automático antes de la expiración del token.
     * @param {string} token - Token JWT activo de la sesión.
     */
    const programarAlertasExpiracion = (token) => {
        limpiarTimers();

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expMs = payload.exp * 1000;
            const ahora = Date.now();
            const tiempoRestante = expMs - ahora;

            if (tiempoRestante <= 0) return; 

            // --- Notificación de advertencia: 5 minutos antes de expirar ---
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
                        timer: 60000, 
                        timerProgressBar: true,
                    });
                }, tiempoAviso);
                timersRef.current.push(t1);
            }

            // --- Disparador automático de cierre de sesión al expirar ---
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

    // ==========================================
    // ESTADOS INICIALES (ESTADO DE AUTENTICACIÓN)
    // ==========================================

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

    // ==========================================
    // FLUJOS CORE DE AUTENTICACIÓN
    // ==========================================

    /**
     * Autentica un usuario, recupera su perfil completo de la base de datos y monta la sesión.
     */
    const login = async (data) => {
        const response = await loginUsuario(data);
        let numeroDocumento = null;
        let tipoDocumento = null;

        // Intento de obtener el perfil completo del usuario para extraer la información del documento.
        try {
            const perfilRes = await fetch(
                `${import.meta.env.VITE_API_URL}/api/usuarios/perfil/${response.id}`,
                {
                    headers: { Authorization: `Bearer ${response.token}` }
                }
            );
            if (perfilRes.ok) {
                const perfil = await perfilRes.json();
                // Capturamos el número y el tipo según la respuesta real de tu backend
                numeroDocumento = perfil.documento?.numeroD || null;
                tipoDocumento = perfil.documento?.tipoD || null;
            } else {
                console.warn("No se pudo obtener perfil al loguear. Status:", perfilRes.status);
            }
        } catch (e) {
            console.warn("No se pudo obtener el perfil completo:", e);
        }

        // Construcción del objeto de usuario estructurado exactamente como pide tu modelo/interfaz
        const userData = {
            id: response.id,
            usuario: response.usuario,
            nombreCompleto: response.nombreCompleto,
            roles: response.roles,
            // Sincronizado con la interfaz anidada de TypeScript y listo para usar con el custom hook
            documento: {
                tipo: tipoDocumento || "",
                numero: numeroDocumento || ""
            }
        };

        // Persistencia local
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(userData));
        
        // Sincronización de estados
        setToken(response.token);
        setUser(userData);
        programarAlertasExpiracion(response.token);

        return response;
    };

    /**
     * Destruye la sesión de manera local y remota en el servidor.
     */
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
            console.warn("El logout en el servidor falló, procediendo con limpieza local:", err.message);
        } 
        finally {
            localStorage.removeItem("token"); 
            localStorage.removeItem("user");  
            setToken(null);
            setUser(null);
        }
    };

    /**
     * Registra un nuevo usuario en el sistema externo.
     */
    const registro = async (data) => {
        return await registrarUsuario(data);
    };

    // ==========================================
    // MÉTODOS DE COMPROBACIÓN / ROLES
    // ==========================================
    const isAdmin = () => user?.roles?.includes("ROL_ADMIN");
    const isAuthenticated = () => !!token && tokenEsValido(token);

    // ==========================================
    // RENDERIZADO DEL PROVIDER
    // ========================================== 
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