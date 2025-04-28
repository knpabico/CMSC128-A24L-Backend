"use client";
import { signUpFormSchema } from "@/validation/auth/sign-up-form-schema";
import * as z from "zod";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { workFieldOptions } from "@/data/work-field-options";
import { techStackOptions } from "@/data/tech-stack-options";
import { useRouter } from "next/navigation";

// components
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, HourglassIcon } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import LocationSelector from "@/components/ui/location-input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagsInput } from "@/components/ui/tags-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "@/components/ui/multi-select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TermsDialog } from "./terms-dialog";
import { registerUser } from "./actions";
import { toastError, toastSuccess } from "@/components/ui/sonner";
import { Career } from "./sign-up-fields/career";
import { Personal } from "./sign-up-fields/personal";
import { Education } from "./sign-up-fields/education";
import { Affiliation } from "./sign-up-fields/affiliation";
import { NameAndPhoto } from "./sign-up-fields/name-and-photo";
import { UserCredentials } from "./sign-up-fields/credentials";

import Image from "next/image";
import physciImage from "./physci.png";
import googleImage from "./google.png";

// =================================================== NOTES ==========================================================================
// MODEL
// export interface Alumnus {
//   // personal information
//   name: string;
//   email: string;
//   password: string;
//   passwordConfirm: string;
//   studentNumber: string;
//   graduationYear: string;
//   currentLocation: string;

//   // career information
//   employmentStatus: string;	// employed, self-employed, unemployed, retired, yung purely nag-a-aral like masters di pa considered
//   companyName?: string;		// hide this if self-employed
//   jobTitle?: string;
//   workField?: string;
//   workSetup?: string;		// onsite, wfh, hybrid, remote
//   workLocation?: string;	// hide rin ata to if self employed
//   skills?: string[];
//   techStack: string[];
//   linkedinLink?: string;
//   githubLink?: string;

//   // additional information
//   affiliations: string[];
//   acceptTerms: boolean;
//   subscribeToNewsletter: boolean;
// }

// add siguro years of experience

// notes:
// - yung acceptTerms, di siya i-istore sa database, required lang siya para mapindot sign up button
// - optional yung ibang fields sa career information para sa mga retired
// - pero kapag employed pinili, magiging required fields sila
// - 1982 ata nagsimula ICS, so I assume na yung SN format sa year na yan ay same na nung sa ngayon??? XXXX-YYYYY
// - Additional fields??? Years of experience? para mas maganda search filtering if may recruiter na naghahanap ng employees?
// - Add ng 'looking for work' option sa Employment Status tapos ishow yung Field of Work at Years of Experience na input fields?
// =====================================================================================================================================

const formParts = [
  //first part, user credentials
  {
    id: "credentials",
    name: "User Credentials",
    fields: ["email", "password", "passwordConfirm"],
  },
  //Profile info after validating user credentials
  {
    id: "profile",
    name: "Your Profile",
    fields: [
      "firstName",
      "middleName",
      "suffix",
      "lastName",
      "birthDate",
      "address",
      "studentNumber",
      "affiliation",
      "bachelors",
      "masters",
      "doctoral",
      "career",
      "acceptTerms",
      "subscribeToNewsletter",
    ],
  },
];

export default function RegistrationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  //for identifying whether the user is at the credentials part or profile part of the form
  const [currentPart, setCurrentPart] = useState(0);
  //const [presentCareer, setPresentCareer] = useState<boolean>([false]);

  //for preventing double click
  const [disableGoNext, setDisableGoNext] = useState(false);
  const [disableGoBack, setDisableGoBack] = useState(false);

  const router = useRouter();

  // create a react hook form
  // create the form definition using the signUpFormSchema
  const form = useForm<z.infer<typeof signUpFormSchema>>({
    // use zod and the form schema above for validation
    resolver: zodResolver(signUpFormSchema),
    // default values of the fields in the form
    defaultValues: {
      //email and password
      email: "",
      password: "",
      passwordConfirm: "",

      //name
      firstName: "",
      middleName: "",
      suffix: "",
      lastName: "",

      //personal
      //birthday
      birthDate: "",

      //current home address
      address: ["", "", ""], //

      //education
      studentNumber: "",
      affiliation: [], //affiliation name, year joined, university
      bachelors: [{ university: "", yearGraduated: "", major: "" }], //degree program, year graduated, university
      masters: [], //degree program, year graduated, university
      doctoral: [], //degree program, year graduated, university

      // //career
      career: [], //industry, jobTitle, company, startYear, endYear

      acceptTerms: false,
      subscribeToNewsletter: false,
    },
  });

  //dynamic fields for affiliation
  const {
    fields: affiliation,
    append: addAffiliations,
    remove: removeAffiliation,
  } = useFieldArray({ control: form.control, name: "affiliation" });

  //dynamic fields for bachelors
  const {
    fields: bachelors,
    append: addBachelors,
    remove: removeBachelors,
  } = useFieldArray({ control: form.control, name: "bachelors" });

  //dynamic fields for masters
  const {
    fields: masters,
    append: addMasters,
    remove: removeMasters,
  } = useFieldArray({ control: form.control, name: "masters" });

  //dynamic fields for doctoral
  const {
    fields: doctoral,
    append: addDoctoral,
    remove: removeDoctoral,
  } = useFieldArray({ control: form.control, name: "doctoral" });

  //dynamic fields for career
  const {
    fields: career,
    append: addCareer,
    remove: removeCareer,
  } = useFieldArray({ control: form.control, name: "career" });

  const handleSubmit = async (data: z.infer<typeof signUpFormSchema>) => {
    setIsLoading(true);

    console.log("Testing sign-up:");
    console.log(data);
    const response = await registerUser(data);

    //display error or success toast message
    if (response?.error) {
      toastError(response.message);
      setIsLoading(false);
      return;
    }

    // if successful, show a dialog that says
    // wait for admin to approve the account
    setShowDialog(true);
  };

  type fieldName = keyof z.infer<typeof signUpFormSchema>;

  //for proceeding to the "Your Profile" part after validating the user credentials
  const goNext = async () => {
    //temporarily disable the go next button to prevent double click
    setDisableGoNext(true);
    const currentFields = formParts[currentPart].fields;
    const result = await form.trigger(currentFields as fieldName[], {
      shouldFocus: true,
    });

    //if true, part of form is validated. Else, some part of the form has errors
    if (!result) {
      //re-enable the go next button
      setDisableGoNext(false);
      return;
    }
    if (currentPart < formParts.length - 1) {
      //checking if already in the last part of the form
      if (currentPart === formParts.length - 1) {
        form.handleSubmit(handleSubmit);
      } else if (currentPart === formParts.length - 2) {
        setCurrentPart((currentPart) => currentPart + 1);
      }
    }

    //re-enable the go next button
    setDisableGoNext(false);
  };

  //if on the second part, can press a button to go back to the user credentials part
  const goBack = () => {
    //temporarily disable the go back button to prevent double click
    //might not be needed for this function since it is fast
    // but just to be sure
    setDisableGoBack(true);
    if (currentPart > 0) {
      setCurrentPart((currentPart) => currentPart - 1);
    }
    //re-enable the go back button
    setDisableGoBack(false);
  };

  return (
    // shadcn/ui form docs: https://ui.shadcn.com/docs/components/form
    // create the UI of the form
    <>
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <fieldset
              disabled={form.formState.isSubmitting || isLoading}
              className=""
            >
              {/*USER CREDENTIALS SECTION */}
              {currentPart === 0 && (
                <div className="flex min-h-screen">
                  <div className="flex w-[50%] justify-center items-center">
                    <div className="flex flex-col w-full mx-37 items-center">
                      <p className="text-5xl font-bold text-[#0856ba] pb-10">
                        Create an account
                      </p>

                      <div className="w-full px-9">
                        <div className="space-y-7 w-full">
                          <button className="border-2 border-[#0856ba] flex justify-center items-center p-2 rounded-full space-x-3 cursor-pointer w-full hover:bg-[#92b2dc]">
                            <Image
                              src={googleImage}
                              alt="hello"
                              className="w-6 h-6"
                            />
                            <p className="text-[#0856ba]">
                              Continue with Google
                            </p>
                          </button>

                          <hr></hr>

                          <div className="flex flex-col gap-5">
                            <UserCredentials form={form}></UserCredentials>

                            <Button
                              type="button"
                              onClick={goNext}
                              className="bg-[#0856ba] text-white p-3 rounded-full cursor-pointer hover:bg-[#92b2dc]"
                            >
                              Sign up
                            </Button>
                          </div>

                          <div className="flex justify-center items-center space-x-2">
                            <p>Already have an account?</p>
                            <button
                              disabled={
                                form.formState.isSubmitting || isLoading
                              }
                              className="hover:underline text-[#0856ba]"
                            >
                              <Link href="/login">Log in</Link>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-[50%] relative">
                    <Image
                      src={physciImage}
                      alt="hello"
                      className="w-full h-full object-cover"
                      layout="fill"
                    />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-70 h-70 rounded-full"></div>
                  </div>
                </div>
              )}

              {currentPart === 1 && (
                <>
                  {/* NAME AND PHOTO SECTION*/}
                  <NameAndPhoto form={form}></NameAndPhoto>

                  {/* PERSONAL SECTION */}
                  <Personal form={form}></Personal>

                  {/* EDUCATION SECTION */}
                  <div>
                    {/* display the SN field*/}
                    <div className="grid grid-cols-12 gap-4">
                      {/* studentNumber form field */}
                      <div className="col-span-12">
                        <FormField
                          control={form.control}
                          name="studentNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Student Number at UPLB*</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="2025-12345"
                                  type="text"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* affiliations form field */}
                    <div className="mt-5">
                      <p>AFFILIATIONS</p>
                      {affiliation.map((aff, index) => (
                        <div key={aff.id}>
                          {index > 0 && (
                            <button
                              className="flex justify-center bg-blue-500 text-white rounded-full items-center w-5 h-5 "
                              type="button"
                              onClick={() => removeAffiliation(index)}
                            >
                              -
                            </button>
                          )}

                          <Affiliation index={index} form={form}></Affiliation>
                        </div>
                      ))}

                      {/*add  fields button */}
                      <button
                        className="flex justify-center bg-blue-500 text-white rounded-full items-center w-5 h-5"
                        type="button"
                        onClick={() => {
                          addAffiliations({
                            university: "",
                            yearJoined: "",
                            affiliationName: "",
                          });
                        }}
                      >
                        +
                      </button>
                    </div>

                    {/* bachelor's form field */}
                    <div className="mt-5">
                      <p>BACHELOR'S</p>
                      {bachelors.map((bachelor, index) => (
                        <div key={bachelor.id}>
                          {index > 0 && (
                            <button
                              className="flex justify-center bg-blue-500 text-white rounded-full items-center w-5 h-5 "
                              type="button"
                              onClick={() => removeBachelors(index)}
                            >
                              -
                            </button>
                          )}

                          <Education
                            index={index}
                            form={form}
                            type={"bachelors"}
                          ></Education>
                        </div>
                      ))}

                      {/*add bachelors fields button */}
                      <button
                        className="flex justify-center bg-blue-500 text-white rounded-full items-center w-5 h-5"
                        type="button"
                        onClick={() => {
                          addBachelors({
                            university: "",
                            yearGraduated: "",
                            major: "",
                          });
                        }}
                      >
                        +
                      </button>
                    </div>

                    {/* master's form field */}

                    <div className="mt-5">
                      <p>MASTER'S</p>
                      {masters.map((master, index) => (
                        <div key={master.id}>
                          <button
                            className="flex justify-center bg-blue-500 text-white rounded-full items-center w-5 h-5 "
                            type="button"
                            onClick={() => removeMasters(index)}
                          >
                            -
                          </button>

                          <Education
                            index={index}
                            form={form}
                            type={"masters"}
                          ></Education>
                        </div>
                      ))}

                      {/*add  fields button */}
                      <button
                        className="flex justify-center bg-blue-500 text-white rounded-full items-center w-5 h-5"
                        type="button"
                        onClick={() => {
                          addMasters({
                            university: "",
                            yearGraduated: "",
                            major: "",
                          });
                        }}
                      >
                        +
                      </button>
                    </div>

                    {/* doctoral form field */}
                    <div className="mt-5">
                      <p>DOCTORAL</p>
                      {doctoral.map((doc, index) => (
                        <div key={doc.id}>
                          <button
                            className="flex justify-center bg-blue-500 text-white rounded-full items-center w-5 h-5 "
                            type="button"
                            onClick={() => removeDoctoral(index)}
                          >
                            -
                          </button>

                          <Education
                            index={index}
                            form={form}
                            type={"doctoral"}
                          ></Education>
                        </div>
                      ))}

                      {/*add  fields button */}
                      <button
                        className="flex justify-center bg-blue-500 text-white rounded-full items-center w-5 h-5"
                        type="button"
                        onClick={() => {
                          addDoctoral({
                            university: "",
                            yearGraduated: "",
                            major: "",
                          });
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* CAREER SECTION */}
                  <div className="mt-5">
                    <p>CAREER</p>
                    {career.map((car, index) => (
                      <div key={car.id}>
                        {/*remove field button */}
                        {index > 0 && (
                          <button
                            className="flex justify-center bg-blue-500 text-white rounded-full items-center w-5 h-5 "
                            type="button"
                            onClick={() => removeCareer(index)}
                          >
                            -
                          </button>
                        )}
                        {/* career form field */}
                        <Career index={index} form={form}></Career>
                      </div>
                    ))}
                    {/*add  fields button */}
                    <button
                      className="flex justify-center bg-blue-500 text-white rounded-full items-center w-5 h-5"
                      type="button"
                      onClick={() => {
                        addCareer({
                          industry: "",
                          jobTitle: "",
                          company: "",
                          startYear: "",
                          endYear: "",
                          presentJob: false,
                          location: "",
                          latitude: 14.25,
                          longitude: 121.25,
                          proofOfEmployment: "",
                        });
                      }}
                    >
                      +
                    </button>
                  </div>
                  {/* acceptTerms form field */}
                  <FormField
                    control={form.control}
                    name="acceptTerms"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex gap-2 justify-start items-center">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="inline">
                            I accept the <TermsDialog />
                            {/* <span>
                              <Link
                                href="/terms"
                                className="underline hover:text-blue-500 font-bold"
                              >
                                terms and conditions
                              </Link>
                            </span> */}
                          </FormLabel>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* subscribeToNewsletter form field */}
                  <FormField
                    control={form.control}
                    name="subscribeToNewsletter"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex gap-2 justify-start items-center">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Subscribe to our newsletter</FormLabel>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* submit button */}
              {currentPart === 1 && (
                <div className="grid grid-cols-12 gap-4">
                  <Button
                    className="col-span-6"
                    variant="outline"
                    type="button"
                    onClick={goBack}
                  >
                    Back
                  </Button>
                  <Button
                    className="col-span-6"
                    variant="outline"
                    type="submit"
                  >
                    Submit
                  </Button>

                  <div className="flex justify-center items-center space-x-2">
                    <p>Already have an account?</p>
                    <button
                      disabled={form.formState.isSubmitting || isLoading}
                      className="hover:underline text-[#0856ba]"
                    >
                      <Link href="/login">Login</Link>
                    </button>
                  </div>
                </div>
              )}
            </fieldset>
          </form>
        </Form>
      </div>

      {/* wait for admin's approval dialog */}
      <Dialog
        open={showDialog}
        onOpenChange={(isOpen) => {
          setShowDialog(isOpen);
          // redirect the user after they manually close the dialog box
          if (!isOpen) {
            router.push("/");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HourglassIcon /> Account Pending Approval
            </DialogTitle>
          </DialogHeader>
          <p>
            Please wait for the admin to approve your account.
            <br />
            An email will be sent to you once it is approved.
          </p>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
