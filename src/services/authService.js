const BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Autentica a un usuario en el sistema.
 * @param {Object} data - Datos de credenciales ({ username, password }).
 * @returns {Promise<Object>} Respuesta JSON con el token y datos básicos del usuario si es exitoso.
 * @throws {Object} Error formateado con un mensaje amigable para el usuario.
 */
export async function loginUsuario(data) {
    try {
      // Realiza la solicitud de inicio de sesión al backend
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: data.username,
                password: data.password,
            }),
        });

        // Convierte la respuesta a JSON
        const json = await res.json();

        // Validación de respuesta HTTP
        if (!res.ok) {
            const mensaje = json.error === "Bad credentials" || json.message === "Bad credentials"
                ? "Usuario o contraseña incorrectos"
                : json.error || json.message || "Error al iniciar sesión";
            throw { message: mensaje };
        }

        return json;

    // Manejo de errores de conexión o inesperados
    } catch (error) {
        // Si el error ya fue formateado y lanzado en el bloque 'if', lo redirige directamente
        if (error.message) throw error;
        throw { message: "Error de conexión con el servidor" };
    }
}

/**
 * Registra un nuevo usuario tipo cliente en la base de datos del sistema.
 * @param {Object} data - Formulario con la información del nuevo usuario.
 * @returns {Promise<Object>} Objeto del usuario creado.
 * @throws {Object} Detalle de los errores encontrados durante la validación del registro.
 */
export async function registrarUsuario(data) {
    try {

      // Realiza la solicitud de registro al backend
        const res = await fetch(`${BASE_URL}/api/usuarios/registro`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nombre: data.nombre,
                apellido: data.apellido,
                documento: {
                    tipoD: data.tipoDoc,
                    numeroD: data.numeroDoc,
                },

                // Información de contacto y credenciales
                email: data.email,
                username: data.username,
                password: data.password,
                estado: "ACTIVO",
                roles: ["ROL_CLIENTE"], // Asignación automática del rol por defecto
            }),
        });

        // Convierte la respuesta a JSON
        const json = await res.json();

        // Validación de respuesta HTTP
        if (!res.ok) {
            throw {
                message: json.error || "Error al registrar",
                errores: json.errores || null,
            };
        }

        return json;

    } catch (error) {
        if (error.message) throw error;
        throw { message: "Error de conexión con el servidor" };
    }
}

/**
 * Permite cambiar o recuperar la contraseña validando la identidad previa del usuario.
 * @param {Object} data - Objeto con ({ username, passwordAntigua, nuevaPassword }).
 * @returns {Promise<Object>} Confirmación del cambio exitoso.
 * @throws {Object} Error descriptivo si los datos o la contraseña previa no coinciden.
 */
export async function recuperarPassword(data) {
    try {

      // Realiza la solicitud de recuperación de contraseña al backend
        const res = await fetch(`${BASE_URL}/auth/recuperar-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: data.username,
                passwordAntigua: data.passwordAntigua,
                nuevaPassword: data.nuevaPassword,
            }),
        });

        const json = await res.json();
        
        // Validación de respuesta HTTP
        if (!res.ok) {
            throw { message: json.error || "Error al recuperar contraseña" };
        }
        
        return json;

    } catch (error) {
        if (error.message) throw error;
        throw { message: "Error de conexión con el servidor" };
    }
}