import { z } from "zod";

export const registerSchema = z.object({
    nombre: z.string().min(1, "El nombre es requerido"),
    apellido: z.string().min(1, "El apellido es requerido"),
    tipoDoc: z.string().min(1, "Seleccione un tipo de documento"),
    email: z.string().email("Email inválido").min(1, "El email es requerido"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string().min(8, "Debe confirmar la contraseña"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"], // Señala el error en el campo de confirmar
});

export type RegisterFormData = z.infer<typeof registerSchema>;