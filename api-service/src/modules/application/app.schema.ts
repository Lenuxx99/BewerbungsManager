import { z } from "zod";

const dateSchema = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}$/,
    "Datum muss im Format YYYY-MM-DD sein."
  );

export const applicationSchema = z.object({
  body: z
    .object({
      firma: z
        .string()
        .trim()
        .min(1, "Firma ist erforderlich.")
        .max(255, "Firma darf maximal 255 Zeichen lang sein."),

      stelle: z
        .string()
        .trim()
        .min(1, "Stelle ist erforderlich.")
        .max(255, "Stelle darf maximal 255 Zeichen lang sein."),

      datum: dateSchema,

      status: z.enum([
        "OFFEN",
        "INTERVIEW",
        "ZUGESAGT",
        "ABGESAGT",
      ]),

      notizen: z
        .string()
        .trim()
        .max(
          1000,
          "Notizen dürfen maximal 1000 Zeichen lang sein."
        )
        .optional(),

      interview_date: z
        .union([
          dateSchema,
          z.literal(""),
          z.null(),
        ])
        .optional(),
    })
    .superRefine((data, ctx) => {
      if (
        data.status === "INTERVIEW" &&
        !data.interview_date
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["interview_date"],
          message:
            "Bei Status INTERVIEW ist ein Interviewdatum erforderlich.",
        });
      }
    }),
});


export type ApplicationInput =
  z.infer<typeof applicationSchema>["body"];