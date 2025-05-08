import { z } from "zod";

// this schema defines the add student's forms fields and their validations
// and some conditions for those fields
export const studentSchema = z.object({
  name: z.string().min(1, "Input the student's name"),
  studentNumber: z
    .string()
    .refine((input) => {
      const regex = /^\d{4}-\d{5}$/;
      return regex.test(input);
    }, "Format: YYYY-XXXXX")
    .refine((input) => {
      const regex = /^(19[8-9]\d|20\d\d|2100)-\d{5}$/;
      return regex.test(input);
    }, "Please make sure that your student number is valid"),
  age: z.coerce.number({ invalid_type_error: "Please enter a valid age" }),
  shortBackground: z.string().min(1, "Input a short background"),
  address: z.string().min(1, "Input the student's address"),
  emailAddress: z.string().email("Please input a valid email"),
  background: z.string().min(1, "Input a background"),
});
