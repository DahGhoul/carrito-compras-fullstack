import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/, "Debe incluir una mayuscula")
      .regex(/[0-9]/, "Debe incluir un numero"),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    phone: z.string().optional()
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1)
  })
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(10)
  })
});

export const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(10)
  })
});