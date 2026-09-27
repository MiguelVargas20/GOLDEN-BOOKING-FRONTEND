// src/modules/auth/schemas/RegisterSchema.tsx
import { z } from "zod";

// Mismas reglas que el backend (UsuarioRegistroDto): si no coinciden, el
// usuario ve un error del servidor en vez del aviso junto al campo.
const hoy = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const registerSchema = z
  .object({
    nombre: z.string().trim().min(2, "Mínimo 2 caracteres").max(60, "Máximo 60 caracteres"),
    apellido: z.string().trim().min(2, "Mínimo 2 caracteres").max(60, "Máximo 60 caracteres"),
    tipoDoc: z.string().min(1, "Selecciona un tipo de documento"),
    numeroDoc: z.string().trim()
      .min(5, "Mínimo 5 caracteres").max(15, "Máximo 15 caracteres")
      .regex(/^\S+$/, "Sin espacios"),
    fechaNacimiento: z.string()
      .min(1, "Indica tu fecha de nacimiento")
      // "YYYY-MM-DD" se compara bien como texto
      .refine((v) => v < hoy(), "Debe ser una fecha pasada")
      .refine((v) => v >= "1900-01-01", "Revisa el año"),
    email: z.string().trim().email("Correo inválido"),
    telefono: z.string().trim().regex(/^\+?[0-9 ]{7,15}$/, "Entre 7 y 15 dígitos"),
    calle: z.string().trim().max(40, "Máximo 40 caracteres").optional(),
    carrera: z.string().trim().max(40, "Máximo 40 caracteres").optional(),
    ciudad: z.string().trim().min(2, "Indica tu ciudad").max(60, "Máximo 60 caracteres"),
    pais: z.string().trim().min(2, "Indica tu país").max(60, "Máximo 60 caracteres"),
    username: z.string().trim()
      .min(4, "Mínimo 4 caracteres").max(20, "Máximo 20 caracteres")
      .regex(/^[A-Za-z0-9._-]+$/, "Solo letras, números, punto, guion y guion bajo"),
    password: z.string()
      .min(8, "Mínimo 8 caracteres")
      .max(30, "Máximo 30 caracteres")
      .regex(/[A-Z]/, "Debe tener al menos una mayúscula")
      .regex(/[0-9]/, "Debe tener al menos un número"),
    confirmarPassword: z.string().min(1, "Repite la contraseña"),
  })
  .refine((d) => d.password === d.confirmarPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarPassword"],
  });
