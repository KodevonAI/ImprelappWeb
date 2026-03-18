import { z } from "zod";

export const checkoutSchema = z.object({
  customerName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  customerEmail: z.string().email("Email inválido"),
  customerPhone: z.string().optional(),
  addressStreet: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: z.string().optional(),
  notes: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

export const productSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  price: z.coerce.number().positive("El precio debe ser mayor a 0"),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo"),
  sku: z.string().optional(),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  categoryId: z.string().min(1, "Selecciona una categoría"),
});

export type ProductFormData = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  active: z.boolean().default(true),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
