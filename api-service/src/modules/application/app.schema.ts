import { z } from "zod";

export const applicationSchema = z.object({
  firma: z
    .string()
    .min(1, "Firma ist erforderlich.")
    .max(255),

  stelle: z
    .string()
    .min(1, "Stelle ist erforderlich.")
    .max(255),

  datum: z
    .string()
    .min(1, "Datum ist erforderlich."),

  status: z.enum([
    "OFFEN",
    "INTERVIEW",
    "ZUGESAGT",
    "ABGESAGT",
  ]),

  notizen: z
    .string()
    .max(1000, "Notizen dürfen maximal 1000 Zeichen lang sein.")
    .optional(),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;