import { z } from "zod";

// this schema defines the login form's fields, the types of those fields
// and some conditions for those fields
export const LoginFormSchema = z.object({
  email: z.string().email("Please input a valid email"),
  password: z.string().min(1, "Input your password"),
});
