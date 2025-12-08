import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string(),
});