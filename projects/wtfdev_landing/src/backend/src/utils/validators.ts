import { z } from "zod";

export const createContactSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be at most 255 characters"),
  email: z.string().email("Invalid email format").max(255),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be at most 2000 characters"),
  company: z.string().max(255).optional(),
  phone: z.string().max(50).optional(),
  service_interest: z.string().max(100).optional(),
});

export const contactQuerySchema = z.object({
  status: z.enum(["pending", "contacted", "closed"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(["created_at", "name", "email", "status"]).default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const newsletterSubscribeSchema = z.object({
  email: z.string().email("Invalid email format").max(255),
  source: z.string().max(50).default("website"),
});

export const newsletterUnsubscribeSchema = z.object({
  email: z.string().email("Invalid email format"),
  token: z.string().min(1, "Token is required"),
});

export const portfolioQuerySchema = z.object({
  category: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const uuidParamSchema = z.object({
  id: z.string().uuid("Invalid UUID format"),
});

export const slugParamSchema = z.object({
  slug: z.string().min(1),
});

export const servicesQuerySchema = z.object({
  include_inactive: z
    .union([z.literal("true"), z.literal("false")])
    .default("false" as const)
    .transform((v) => v === "true"),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type ContactQueryInput = z.infer<typeof contactQuerySchema>;
export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>;
export type NewsletterUnsubscribeInput = z.infer<typeof newsletterUnsubscribeSchema>;
export type PortfolioQueryInput = z.infer<typeof portfolioQuerySchema>;
export type ServicesQueryInput = z.infer<typeof servicesQuerySchema>;
