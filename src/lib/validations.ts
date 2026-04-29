import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z
    .string()
    .min(8, "Minimo 8 caratteri")
    .regex(/[A-Z]/, "Almeno una maiuscola")
    .regex(/[0-9]/, "Almeno un numero")
    .regex(/[^A-Za-z0-9]/, "Almeno un carattere speciale"),
  username: z
    .string()
    .min(3, "Minimo 3 caratteri")
    .max(30, "Massimo 30 caratteri")
    .regex(/^[a-z0-9_]+$/, "Solo lettere minuscole, numeri e _"),
  display_name: z.string().min(2, "Minimo 2 caratteri").max(50),
});

export const loginSchema = z.object({
  identifier: z.string().min(1, "Campo obbligatorio"),
  password: z.string().min(1, "Campo obbligatorio"),
});

export const postSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().min(1, "Il post non può essere vuoto").max(5000),
  category: z.string().max(50).optional(),
  tags: z.array(z.string().max(30)).max(10).default([]),
  visibility: z.enum(["public", "followers"]).default("public"),
});

export const profileUpdateSchema = z.object({
  display_name: z.string().min(2, "Minimo 2 caratteri").max(50),
  bio: z.string().max(300).optional(),
  role: z.enum(["user", "startupper", "researcher", "admin"] as const),
  country_code: z.preprocess(v => (v === "" ? undefined : v), z.string().length(2).optional()),
  city: z.string().max(100).optional(),
});

export const reportSchema = z.object({
  target_type: z.enum(["user", "post", "comment"]),
  target_id: z.string().uuid(),
  reason: z.string().min(1, "Seleziona un motivo"),
  description: z.string().max(500).optional(),
});

export const feedbackSchema = z.object({
  category: z.enum(["suggestion", "compliment", "problem", "idea"]),
  message: z.string().min(10, "Minimo 10 caratteri").max(2000),
});

export const bugReportSchema = z.object({
  title: z.string().min(5, "Minimo 5 caratteri").max(200),
  description: z.string().min(20, "Descrivi il problema in dettaglio").max(5000),
  severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
});

export const projectSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(2000).optional(),
  stage: z.enum(["idea", "mvp", "growth", "scaling", "acquired"]),
  country_code: z.string().length(2).optional(),
  looking_for: z.array(z.string().max(50)).max(10).default([]),
  is_public: z.boolean().default(true),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PostInput = z.infer<typeof postSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;
export type BugReportInput = z.infer<typeof bugReportSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
