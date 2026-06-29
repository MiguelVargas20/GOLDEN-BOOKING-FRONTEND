import { createContext, useContext, useState, useRef } from "react";
import Swal from "sweetalert2";
import { loginUsuario, registrarUsuario } from "../services/authService";

const AuthContext = createContext();

/**
 * Función auxiliar externa para validar la vigencia de un JWT (JSON Web Token).
 * Se ubica fuera del componente para evitar recreaciones en memoria en cada renderizado.
 * * @param {string} token - El JWT a evaluar.
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

        // Se intenta decodificar el token y calcular los tiempos de expiración.
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expMs = payload.exp * 1000;
            const ahora = Date.now();
            const tiempoRestante = expMs - ahora;

            // Si el tiempo restante es negativo o cero, no se programa nada.
            if (tiempoRestante <= 0) return; // Si ya expiró, no procesa nada.

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
                        timer: 60000, // Se cierra automáticamente tras 1 minuto.
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
                    allowOutsideClick: false, // Forzar interacción del usuario.
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

    // Inicialización de Token: Limpia el almacenamiento si ya caducó, sino programa alertas.
    const [token, setToken] = useState(() => {
        const savedToken = localStorage.getItem("token");
        if (savedToken && !tokenEsValido(savedToken)) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            return null;
        }
        if (savedToken) {
            // El setTimeout a 0 asegura que React monte por completo el árbol de componentes antes de ejecutar SweetAlerts.
            setTimeout(() => programarAlertasExpiracion(savedToken), 0);
        }
        return savedToken || null;
    });

    // Inicialización de datos de Usuario: Condicionado a la vigencia del token previo.
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

        // Intento de obtener el perfil completo del usuario para extraer el número de documento.
        try {
            const perfilRes = await fetch(
                `${import.meta.env.VITE_API_URL}/api/usuarios/${response.id}`,
                {
                    headers: { Authorization: `Bearer ${response.token}` }
                }
            );

            // Solo se procesa la respuesta si es exitosa (status 200-299).
            if (perfilRes.ok) {
                const perfil = await perfilRes.json();
                numeroDocumento = perfil.documento?.numeroD || null;
            }
        } catch (e) {
            console.warn("No se pudo obtener el perfil completo:", e);
        }

        // Construcción del objeto de usuario con los datos esenciales.
        const userData = {
            id: response.id,
            usuario: response.usuario,
            nombreCompleto: response.nombreCompleto,
            roles: response.roles,
            numeroDocumento: numeroDocumento,
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
        
        // Intento de notificación al servidor para invalidar el token, pero no bloquea la limpieza local.
        try {
            const savedToken = localStorage.getItem("token"); 

            // Solo se hace la llamada si hay un token válido.
            if (savedToken) {
                await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${savedToken}` }
                });
            }
        } catch (err) {
            console.warn("El logout en el servidor falló, procediendo con limpieza local:", err.message);
        } 
        
        // Garantiza la limpieza local de cualquier manera, incluso si la llamada al servidor falla.
        finally {
            // Se garantiza la remoción local bajo cualquier circunstancia dentro del bloque 'finally'
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

// Hook personalizado para consumir el contexto de manera directa
export const useAuth = () => useContext(AuthContext);