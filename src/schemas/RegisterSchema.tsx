import { z } from "zod";

export const registerSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener mínimo 2 caracteres"),
  apellido: z.string().min(2, "El apellido debe tener mínimo 2 caracteres"),
  tipoDoc: z.string().min(1, "Selecciona un tipo de documento"),
  numeroDoc: z.string().min(5, "El número de documento debe tener mínimo 5 caracteres"),
  username: z.string().min(3, "El usuario debe tener mínimo 3 caracteres"),
  email: z.string().email("El email no tiene un formato válido"),
  password: z.string().min(6, "La contraseña debe tener mínimo 6 caracteres"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;