import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(3, "El usuario debe tener mínimo 3 caracteres"),
  password: z.string().min(6, "La contraseña debe tener mínimo 6 caracteres"),
});
export type LoginFormData = z.infer<typeof loginSchema>;