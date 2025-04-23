import { z } from "zod";

// this schema defines the name of the form's fields, their types,
// and the conditions for those fields
const baseSchema = z.object({
  firstName: z.string().min(1, "Input your first name"),
  middleName: z
    .string()
    .min(1, "Input your middle name")
    .optional()
    .or(z.literal("")),
  suffix: z.string().min(1, "Input your suffix").optional().or(z.literal("")),
  lastName: z.string().min(1, "Input your last name"),
  email: z.string().email(),
  address: z
    .tuple([
      z.string().min(1, "Input your country"), //country
      z.string().optional().or(z.literal("")), // city/municipality (optional)
      z.string().optional().or(z.literal("")), //province/state (optional)
    ])
    .refine((input) => input[0] !== "", "Please input your address"),
  affiliation: z.tuple([z.string(), z.string(), z.string()]).optional(),

  bachelors: z
    .tuple([
      z.string().min(1, "Input  your degree program"),
      z.string().refine((input) => {
        const regex = /^(19[8-9]\d|20\d\d|2100)$/;
        return regex.test(input);
      }, "Please input a valid year"),
      z.string().min(1, "Input your university"),
    ])
    .refine((input) => input[0] !== "", "Please input your bachelor's degree"),
  masters: z.tuple([z.string(), z.string(), z.string()]).optional(),
  doctoral: z.tuple([z.string(), z.string(), z.string()]).optional(),
  career: z
    .tuple([z.string(), z.string(), z.string(), z.string(), z.string()])
    .optional(),

  acceptTerms: z
    .boolean()
    .refine(
      (isChecked) => isChecked,
      "You must accept the terms and conditions"
    ),
  subscribeToNewsletter: z.boolean(),
});

const passwordSchema = z
  .object({
    password: z.string().min(8, "Password must contain at least 8 characters"),
    passwordConfirm: z.string(),
  })
  .superRefine((data, ctx) => {
    // check if passwords match
    if (data.password !== data.passwordConfirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["passwordConfirm"],
        message: "Passwords do not match",
      });
    }
  });

const ageAndBirthDateSchema = z.object({
  // age: z.string().refine((age) => !isNaN(parseInt(age)), {
  //   message: "Please input a valid age",
  // }),
  birthDate: z
    .string()
    .refine((date) => new Date(date).toString() !== "Invalid Date", {
      message: "Please input a valid birthdate",
    }),
});

const studentNumberAndGraduationYearSchema = z.object({
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
});

// combine the schemas shown above into a single schema
// we split the schema into multiple schemas to make the validations for a single field
// and the validations in the super refine run at the same time
export const signUpFormSchema = baseSchema
  .and(passwordSchema)
  .and(ageAndBirthDateSchema)
  .and(studentNumberAndGraduationYearSchema);
