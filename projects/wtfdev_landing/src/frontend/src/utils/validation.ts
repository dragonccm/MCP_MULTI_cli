import { z } from "zod/v4";

export const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be under 2000 characters"),
  company: z.string().max(255).optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  service_interest: z.string().max(100).optional().or(z.literal("")),
});

export const newsletterSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
export type NewsletterFormValues = z.infer<typeof newsletterSchema>;
