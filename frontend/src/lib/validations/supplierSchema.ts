import { z } from "zod";
import { PaymentTerms } from "@/types/supplier";

export const supplierCreateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  code: z.string().min(2, "Code must be at least 2 characters").max(20, "Code too long"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  contactPerson: z.string().min(2, "Contact person name required"),
  street: z.string().min(5, "Street address required"),
  city: z.string().min(2, "City required"),
  state: z.string().min(2, "State required"),
  country: z.string().min(2, "Country required"),
  zipCode: z.string().min(3, "Zip code required"),
  taxId: z.string().optional(),
  paymentTerms: z.nativeEnum(PaymentTerms),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const supplierUpdateSchema = supplierCreateSchema.partial();

export type SupplierCreateInput = z.infer<typeof supplierCreateSchema>;
export type SupplierUpdateInput = z.infer<typeof supplierUpdateSchema>;
