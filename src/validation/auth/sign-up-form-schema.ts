<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> origin/fe-feed
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
<<<<<<< HEAD
  currentLocation: z
    .tuple([
      z.string(),
      z.string().optional(), // state is optional
    ])
    .refine((input) => input[0] !== "", "Please input your location"),
  techStack: z.array(z.string()),
  skills: z.array(z.string()).optional(),
  linkedinLink: z
    .string()
    .optional()
    .refine((link) => {
      // if input is provided, then verify if it is valid
      const linkedinRegex = /^((https?:)?\/\/(www\.)?)?linkedin\.com\/in\/..*$/;
      return !link || linkedinRegex.test(link!);
    }, "Please enter a valid LinkedIn link"),
  githubLink: z
    .string()
    .optional()
    .refine((link) => {
      // if input is provided, then verify if it is valid
      const linkedinRegex = /^((https?:)?\/\/(www\.)?)?github\.com\/..*$/;
      return !link || linkedinRegex.test(link!);
    }, "Please enter a valid GitHub link"),
  affiliation: z.array(z.string()).optional(),
=======
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

>>>>>>> origin/fe-feed
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
<<<<<<< HEAD
  age: z.string().refine((age) => !isNaN(parseInt(age)), {
    message: "Please input a valid age",
  }),
=======
  // age: z.string().refine((age) => !isNaN(parseInt(age)), {
  //   message: "Please input a valid age",
  // }),
>>>>>>> origin/fe-feed
  birthDate: z
    .string()
    .refine((date) => new Date(date).toString() !== "Invalid Date", {
      message: "Please input a valid birthdate",
    }),
});

<<<<<<< HEAD
const studentNumberAndGraduationYearSchema = z
  .object({
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
    // di ko malagyan ng custom error message tong graduation year para sa .number() condition
    // pag walang input, 'Expected number, received nan' yung default error message, di ko mabago
    graduationYear: z.string().refine((input) => {
      const regex = /^(19[8-9]\d|20\d\d|2100)$/;
      return regex.test(input);
    }, "Please input a valid graduation year"),
  })
  .superRefine((data, ctx) => {
    const studentYear = parseInt(data.studentNumber.substring(0, 4));
    const graduationYear = parseInt(data.graduationYear);

    if (graduationYear < studentYear + 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["graduationYear"],
        message: "Please input a valid graduation year",
      });
    }
  });

const employmentSchema = z
  .object({
    employmentStatus: z.string().min(1, "Please select your employment status"),
    companyName: z.string().optional(),
    jobTitle: z.string().optional(),
    fieldOfWork: z.string().optional(),
    workSetup: z.string().optional(),
    workLocation: z.tuple([z.string(), z.string().optional()]),
  })
  .superRefine((data, ctx) => {
    // use superRefine() if we need access to multiple fields in a form
    // data is for the form field values
    // ctx will be used for adding error messages to specific form fields

    // companyName must be filled if 'employed' is chosen
    if (data.employmentStatus === "employed" && !data.companyName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["companyName"],
        message: "Please input the name of your company",
      });
    }

    // jobTitle must be filled if 'employed' is chosen
    if (
      (data.employmentStatus === "employed" ||
        data.employmentStatus === "self-employed") &&
      !data.jobTitle
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["jobTitle"],
        message: "Please input your job title",
      });
    }

    // fieldOfWOrk must be filled if 'employed' is chosen
    if (
      (data.employmentStatus === "employed" ||
        data.employmentStatus === "self-employed") &&
      !data.fieldOfWork
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fieldOfWork"],
        message: "Please select your field of work",
      });
    }

    // workSetup must be filled if 'employed' is chosen
    if (data.employmentStatus === "employed" && !data.workSetup) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["workSetup"],
        message: "Please select your work setup",
      });
    }

    // workLocation must be filled if 'employed' is chosen
    if (data.employmentStatus === "employed" && !data.workLocation[0]) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["workLocation"],
        message: "Please input your work location",
      });
    }
  });
=======
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
>>>>>>> origin/fe-feed

// combine the schemas shown above into a single schema
// we split the schema into multiple schemas to make the validations for a single field
// and the validations in the super refine run at the same time
export const signUpFormSchema = baseSchema
  .and(passwordSchema)
  .and(ageAndBirthDateSchema)
<<<<<<< HEAD
  .and(studentNumberAndGraduationYearSchema)
  .and(employmentSchema);
=======
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
>>>>>>> origin/vinly-be-newsletter
=======
  .and(studentNumberAndGraduationYearSchema);
>>>>>>> origin/fe-feed
