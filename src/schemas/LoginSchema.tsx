// src/schemas/LoginSchema.tsx
import { z } from "zod";

// Define the login schema using Zod
export const loginSchema = z.object({

  // Validate that the username is a string with a minimum length of 3 characters
  username: z.string().min(3, "El usuario debe tener mínimo 3 caracteres"),
  
  // Validate that the password is a string with a minimum length of 6 characters
  password: z.string().min(6, "La contraseña debe tener mínimo 6 caracteres"),
});
export type LoginFormData = z.infer<typeof loginSchema>;