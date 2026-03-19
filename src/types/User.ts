//Funcion para definir la estructura de los datos de registro del usuario, incluyendo información personal, documento, email, usuario, contraseña y roles para usar en el archivo UserApi.ts al momento de registrar un nuevo usuario a través de la API (Backend)
export interface RegisterData {
  nombre: string;
  apellido: string;
  documento: {
    tipo: string;
    numero: string;
  };

  email: string;
  usuario: string;
  password: string;
  roles: string[]; 
}