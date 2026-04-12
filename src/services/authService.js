const BASE_URL = "http://localhost:8080";

// Login
export async function loginUsuario(data) {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: data.username,
        password: data.password,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      // ← Traducir mensajes de Spring Security
      const mensaje = json.error === "Bad credentials" || json.message === "Bad credentials"
        ? "Usuario o contraseña incorrectos"
        : json.error || json.message || "Error al iniciar sesión";
      throw { message: mensaje };
    }

    return json;

  } catch (error) {
    if (error.message) throw error;
    throw { message: "Error de conexión con el servidor" };
  }
}

// Registro
export async function registrarUsuario(data) {
  try {
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
        email: data.email,
        username: data.username,
        password: data.password,
        estado: "ACTIVO",
        roles: ["ROL_CLIENTE"],
      }),
    });

    const json = await res.json();

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