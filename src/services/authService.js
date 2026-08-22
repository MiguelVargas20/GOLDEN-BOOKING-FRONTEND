import { extraerMensajeError } from "../api/apiUtils";

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

        // Validación de respuesta HTTP (sin leer el body todavía)
        if (!res.ok) {
            const mensaje = await extraerMensajeError(res, "Error al iniciar sesión");
            const esCredencialInvalida = mensaje.includes("Bad credentials");
            throw { message: esCredencialInvalida ? "Usuario o contraseña incorrectos" : mensaje };
        }

        return await res.json();

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
                    tipo: data.tipoDoc,
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

        // Validación de respuesta HTTP (sin leer el body todavía)
        if (!res.ok) {
            const mensaje = await extraerMensajeError(res, "Error al registrar");
            throw { message: mensaje };
        }

        return await res.json();

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

        // Validación de respuesta HTTP (sin leer el body todavía)
        if (!res.ok) {
            throw { message: await extraerMensajeError(res, "Error al recuperar contraseña") };
        }

        return await res.json();

    } catch (error) {
        if (error.message) throw error;
        throw { message: "Error de conexión con el servidor" };
    }
}

/**
 * Solicita el envío de un correo con un enlace para restablecer la contraseña,
 * cuando el usuario no recuerda su contraseña actual (a diferencia de
 * recuperarPassword, que sí la requiere).
 * @param {string} correo - Correo del usuario que solicita la recuperación.
 * @returns {Promise<Object>} Mensaje de confirmación (genérico por seguridad,
 * no revela si el correo existe o no en el sistema).
 * @throws {Object} Error de conexión con el servidor.
 */
export async function solicitarRecuperacion(correo) {
    try {
        const res = await fetch(`${BASE_URL}/auth/solicitar-recuperacion`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ correo }),
        });

        if (!res.ok) {
            throw { message: await extraerMensajeError(res, "Error al solicitar la recuperación") };
        }

        return await res.json();

    } catch (error) {
        if (error.message) throw error;
        throw { message: "Error de conexión con el servidor" };
    }
}

/**
 * Restablece la contraseña usando el token recibido por correo.
 * @param {Object} data - Objeto con ({ token, nuevaPassword }).
 * @returns {Promise<Object>} Confirmación del cambio exitoso.
 * @throws {Object} Error si el token es inválido, expiró, o la contraseña no es válida.
 */
export async function restablecerPassword(data) {
    try {
        const res = await fetch(`${BASE_URL}/auth/restablecer-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                token: data.token,
                nuevaPassword: data.nuevaPassword,
            }),
        });

        if (!res.ok) {
            throw { message: await extraerMensajeError(res, "Error al restablecer la contraseña") };
        }

        return await res.json();

    } catch (error) {
        if (error.message) throw error;
        throw { message: "Error de conexión con el servidor" };
    }
}