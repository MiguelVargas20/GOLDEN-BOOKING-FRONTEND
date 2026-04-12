import { RegisterData } from "../types/User.ts";

const API_URL = "http://127.0.0.1:8080/api/usuarios";

//Función para registrar un nuevo usuario organizado segun el formato requerido por la API (Backend)
export const registroUsuario = async (data: RegisterData) => {
  const requestBody = {
    nombre: data.nombre,
    apellido: data.apellido,
    documento: {
      tipo: data.documento.tipo,
      numero: data.documento.numero,
    },
    email: data.email,
    usuario: data.usuario,
    password: data.password,
    roles: data.roles,
  };
  console.log("JSON de registro:", requestBody);

  //Peticion POST a la API para registrar el usuario
  const response = await fetch(API_URL + "/registrar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  //Procesar la respuesta de la API(Backend) y manejar errores si los hay
  const responseJson = await response.json();

  if (!response.ok) {
    throw {
      message: responseJson.error || responseJson.errors || "Error al registrar el usuario" ,
      errors: responseJson.errors || responseJson.errores || null,
    };
  }

  return responseJson;
};