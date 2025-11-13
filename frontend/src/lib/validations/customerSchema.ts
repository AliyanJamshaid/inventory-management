import { z } from "zod";

export const customerAddressSchema = z.object({
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  country: z.string().min(1, "Country is required"),
});

export const createCustomerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.enum(["B2B", "B2C"]),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  contactPerson: z.string().optional(),
  address: customerAddressSchema,
  taxId: z.string().optional(),
  creditLimit: z.number().min(0).optional(),
  paymentTerms: z.number().min(0).optional(),
  notes: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
}).refine(
  (data) => {
    // Require contactPerson for B2B customers
    if (data.type === "B2B" && !data.contactPerson) {
      return false;
    }
    return true;
  },
  {
    message: "Contact person is required for B2B customers",
    path: ["contactPerson"],
  }
);

export const updateCustomerSchema = createCustomerSchema.partial();

export const loyaltyTransactionSchema = z.object({
  type: z.enum(["earn", "redeem"]),
  points: z.number().min(1, "Points must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  reference: z.string().optional(),
});

export type CreateCustomerFormData = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerFormData = z.infer<typeof updateCustomerSchema>;
export type LoyaltyTransactionFormData = z.infer<typeof loyaltyTransactionSchema>;
