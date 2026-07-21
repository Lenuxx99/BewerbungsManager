import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Ungültige E-Mail-Adresse"),
    password: z
      .string()
      .min(8, "Das Passwort muss mindestens 8 Zeichen haben"),
    firstName: z.string().min(1, "Vorname ist erforderlich"),
    lastName: z.string().min(1, "Nachname ist erforderlich"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Ungültige E-Mail-Adresse"),
    password: z.string().min(1, "Passwort ist erforderlich"),
  }),
});

export type RegisterInput = z.infer<
  typeof registerSchema
>["body"];

export type LoginInput = z.infer<
  typeof loginSchema
>["body"];