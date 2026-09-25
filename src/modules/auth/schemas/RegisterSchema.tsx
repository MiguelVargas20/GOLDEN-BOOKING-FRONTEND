// src/schemas/RegisterSchema.tsx
import { z } from "zod";

// Define the register schema using Zod
export const registerSchema = z.object({

  // Validate that the first name is a string with a minimum length of 2 characters
  nombre: z.string().min(2, "Mínimo 2 caracteres"),
  apellido: z.string().min(2, "Mínimo 2 caracteres"),
  tipoDoc: z.string().min(1, "Selecciona un tipo de documento"),
  numeroDoc: z.string().min(5, "Mínimo 5 caracteres").max(15, "Máximo 15 caracteres"),
  username: z.string().min(3, "Mínimo 3 caracteres").max(20, "Máximo 20 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string()

  // Validate that the password is a string with a minimum length of 8 characters, a maximum length of 30 characters, and contains at least one uppercase letter and one number
    .min(8, "Mínimo 8 caracteres")           // ← aumentado de 6 a 8
    .max(30, "Máximo 30 caracteres")
    .regex(/[A-Z]/, "Debe tener al menos una mayúscula")
    .regex(/[0-9]/, "Debe tener al menos un número"),
});