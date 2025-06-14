import { z } from "zod";
import { validateFirebaseEmail } from "@/app/(auth)/sign-up/actions";

// this schema defines the name of the form's fields, their types,
// and the conditions for those fields
const baseSchema = z.object({
  image: z.string().optional(),
  firstName: z.string().min(1, "Input your first name"),
  middleName: z
    .string()
    .min(1, "Input your middle name")
    .optional()
    .or(z.literal("")),
  suffix: z.string().min(1, "Input your suffix").optional().or(z.literal("")),
  lastName: z.string().min(1, "Input your last name"),
  email: z
    .string()
    .email("Input a valid email")
    .refine(async (email) => await validateFirebaseEmail(email), {
      message: "Email already exists!",
    }),
  address: z
    .tuple([
      z.string().min(1, "Input your country"), //country
      z.string().min(1, "Input your city/municipality"), // city/municipality
      z.string().min(1, "Input your province/state"), //province/state
    ])
    .refine((input) => input[0] !== "", "Please input your address"),
  fieldOfInterest: z.array(z.string()).optional(),
  affiliation: z
    .array(
      z
        .object({
          affiliationName: z.string().min(1, "Input  your affiliation's name"),
          yearJoined: z.string().refine((input) => {
            const regex = /^(19[8-9]\d|20\d\d|2100)$/;
            const currentYear = new Date().getFullYear(); //get current year for checking
            const validYearTest = regex.test(input);
            let maxYearTest = false;
            //valid if year is <= 2025
            if (parseInt(input, 10) <= currentYear) {
              maxYearTest = true;
            }
            //if true validation passes
            return validYearTest && maxYearTest;
          }, "Please input a valid year"),
          university: z.string().min(1, "Input your affiliation's university"),
        })
        .optional()
    )
    .optional(),

  bachelors: z.array(
    z.object({
      major: z.string().min(1, "Input  your degree program"),
      yearGraduated: z.string().refine((input) => {
        const regex = /^(19[8-9]\d|20\d\d|2100)$/;
        const currentYear = new Date().getFullYear(); //get current year for checking
        const validYearTest = regex.test(input);
        let maxYearTest = false;
        //valid if year is <= 2025
        if (parseInt(input, 10) <= currentYear) {
          maxYearTest = true;
        }
        //if true validation passes
        return validYearTest && maxYearTest;
      }, "Please input a valid year"),
      university: z.string().min(1, "Input your university"),
    })
  ),
  masters: z
    .array(
      z
        .object({
          major: z.string().min(1, "Input  your degree program"),
          yearGraduated: z.string().refine((input) => {
            const regex = /^(19[8-9]\d|20\d\d|2100)$/;
            const currentYear = new Date().getFullYear(); //get current year for checking
            const validYearTest = regex.test(input);
            let maxYearTest = false;
            //valid if year is <= 2025
            if (parseInt(input, 10) <= currentYear) {
              maxYearTest = true;
            }
            //if true validation passes
            return validYearTest && maxYearTest;
          }, "Please input a valid year"),
          university: z.string().min(1, "Input your university"),
        })
        .optional()
    )
    .optional(),
  doctoral: z
    .array(
      z
        .object({
          major: z.string().min(1, "Input  your degree program"),
          yearGraduated: z.string().refine((input) => {
            const regex = /^(19[8-9]\d|20\d\d|2100)$/;
            const currentYear = new Date().getFullYear(); //get current year for checking
            const validYearTest = regex.test(input);
            let maxYearTest = false;
            //valid if year is <= 2025
            if (parseInt(input, 10) <= currentYear) {
              maxYearTest = true;
            }
            //if true validation passes
            return validYearTest && maxYearTest;
          }, "Please input a valid year"),
          university: z.string().min(1, "Input your university"),
        })
        .optional()
    )
    .optional(),
  career: z
    .array(
      z
        .object({
          industry: z.string().min(1, "Input your job's industry"),
          jobTitle: z.string().min(1, "Input your job title"),
          company: z.string().min(1, "Input your company's name"),
          startYear: z.string().refine((input) => {
            const regex = /^(19[8-9]\d|20\d\d|2100)$/;
            const currentYear = new Date().getFullYear(); //get current year for checking
            const validYearTest = regex.test(input);
            let maxYearTest = false;
            //valid if year is <= 2025
            if (parseInt(input, 10) <= currentYear) {
              maxYearTest = true;
            }
            //if true validation passes
            return validYearTest && maxYearTest;
          }, "Please input a valid year"),
          endYear: z.string().refine((input) => {
            const regex = /^(19[8-9]\d|20\d\d|2100)$/;
            const currentYear = new Date().getFullYear(); //get current year for checking
            const validYearTest = regex.test(input);
            let maxYearTest = false;
            //valid if year is <= 2025
            if (parseInt(input, 10) <= currentYear) {
              maxYearTest = true;
            }
            //if true validation passes
            return validYearTest && maxYearTest;
          }, "Please input a valid year"),
          location: z
            .string()
            .min(1, "Input your job's location using the map"),
          latitude: z.number(),
          longitude: z.number(),
        })
        .superRefine((data, ctx) => {
          //endYear should be >= startYear
          if (parseInt(data.endYear, 10) < parseInt(data.startYear, 10)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Start year cannot exceed end year",
              path: ["endYear"],
            });
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Start year cannot exceed end year",
              path: ["startYear"],
            });
          }
        })
    )
    .optional(),
  currentJob: z
    .array(
      z
        .object({
          industry: z.string().min(1, "Input your job's industry"),
          jobTitle: z.string().min(1, "Input your job title"),
          company: z.string().min(1, "Input your company's name"),
          startYear: z.string().refine((input) => {
            const regex = /^(19[8-9]\d|20\d\d|2100)$/;
            const currentYear = new Date().getFullYear(); //get current year for checking
            const validYearTest = regex.test(input);
            let maxYearTest = false;
            //valid if year is <= 2025
            if (parseInt(input, 10) <= currentYear) {
              maxYearTest = true;
            }
            //if true validation passes
            return validYearTest && maxYearTest;
          }, "Please input a valid year"),
          endYear: z.string(),
          location: z
            .string()
            .min(1, "Input your job's location using the map"),
          latitude: z.number(),
          longitude: z.number(),
          hasProof: z.boolean(),
          proof: z.any().optional(),
        })
        .superRefine((data, ctx) => {
          //if no proof, send a message
          if (data.hasProof === false) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Please select a valid document",
              path: ["hasProof"],
            });
          }
        })
    )
    .optional(),

  acceptTerms: z
    .boolean()
    .refine(
      (isChecked) => isChecked,
      "You must accept the terms and conditions"
    ),
  subscribeToNewsletter: z.boolean(),
  contactPrivacy: z.boolean(),
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

//for disabling non-digit keyboard inputs
export const handleYearInput = (e: any) => {
  if (["e", "E", ".", "-", "+"].includes(e.key)) {
    e.preventDefault();
  }
};

// combine the schemas shown above into a single schema
// we split the schema into multiple schemas to make the validations for a single field
// and the validations in the super refine run at the same time
export const signUpFormSchema = baseSchema
  .and(passwordSchema)
  .and(ageAndBirthDateSchema)
  .and(studentNumberAndGraduationYearSchema)
  .superRefine((data, ctx) => {
    //superRefine for validating each of the years
    // Get the birth year from the birthDate as a number
    const birthYear = new Date(data.birthDate).getFullYear();

    //get the year in the student number
    const studentNumberYear = parseInt(data.studentNumber.slice(0, 4), 10);

    //check if the student number year is not after the birth year
    if (studentNumberYear <= birthYear) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Student number year must be after the birth year",
        path: ["studentNumber"],
      });
    }

    // Function for validating each year
    const validateYear = (
      yearField: string | undefined,
      field: string,
      index: number,
      fieldOfField: string
    ) => {
      //check if the year field is empty
      if (!yearField) return;
      //parse the year field to an integer for checking
      const year = parseInt(yearField, 10);
      //the year must be after the birth year
      if (!isNaN(year) && year <= birthYear) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Year must be after the birth year",
          path: [field, index, fieldOfField],
        });
      }
    };

    // Check affiliation
    data.affiliation?.forEach((aff, i) => {
      //validate year joined
      if (aff) validateYear(aff.yearJoined, "affiliation", i, "yearJoined");
    });

    // Check bachelors
    data.bachelors?.forEach((bach, i) => {
      //validate year graduated
      validateYear(bach.yearGraduated, "bachelors", i, "yearGraduated");
    });

    // Check masters
    data.masters?.forEach((mast, i) => {
      //validate year graduated
      if (mast) validateYear(mast.yearGraduated, "masters", i, "yearGraduated");
    });

    // Check doctoral
    data.doctoral?.forEach((doc, i) => {
      //validate year graduated
      if (doc) validateYear(doc.yearGraduated, "doctoral", i, "yearGraduated");
    });

    // Check career
    data.career?.forEach((car, i) => {
      //validate start year
      validateYear(car.startYear, "career", i, "startYear");
      //validate  end year
      validateYear(car.endYear, "career", i, "endYear");
    });

    // Check currentJob
    data.currentJob?.forEach((curr, i) => {
      //validate start year
      validateYear(curr.startYear, "currentJob", i, "startYear");
    });
  });
