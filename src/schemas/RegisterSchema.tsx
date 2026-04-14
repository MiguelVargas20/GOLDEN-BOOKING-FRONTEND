import { z } from "zod";

export const registerSchema = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres"),
  apellido: z.string().min(2, "Mínimo 2 caracteres"),
  tipoDoc: z.string().min(1, "Selecciona un tipo de documento"),
  numeroDoc: z.string().min(5, "Mínimo 5 caracteres").max(15, "Máximo 15 caracteres"),
  username: z.string().min(3, "Mínimo 3 caracteres").max(20, "Máximo 20 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string()
    .min(8, "Mínimo 8 caracteres")           // ← aumentado de 6 a 8
    .max(30, "Máximo 30 caracteres")
    .regex(/[A-Z]/, "Debe tener al menos una mayúscula")
    .regex(/[0-9]/, "Debe tener al menos un número"),
});