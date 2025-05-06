"use client";
import { signUpFormSchema } from "@/validation/auth/sign-up-form-schema";
import * as z from "zod";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { workFieldOptions } from "@/data/work-field-options";
import { techStackOptions } from "@/data/tech-stack-options";
import { useRouter } from "next/navigation";
import { ChevronLeft, Trash2Icon, PlusCircleIcon } from "lucide-react";

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
import { AlumPhotoUpload, uploadToFirebase } from "./sign-up-fields/alum_photo";

import Image from "next/image";
import physciImage from "./physci.png";
import googleImage from "./google.png";
import { uploadDocToFirebase } from "./sign-up-fields/career_proof";
import { useAuth } from "@/context/AuthContext";
import { VerificationCodeModal } from "./sign-up-fields/emailverify";
import { TextField, Autocomplete } from "@mui/material";

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
      "fieldOfInterest",
      "bachelors",
      "masters",
      "doctoral",
      "currentJob",
      "career",
      "acceptTerms",
      "subscribeToNewsletter",
      "contactPrivacy"
    ],
  },
];

export default function RegistrationForm() {
  const [isCodeSent, setIsCodeSent] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  //for identifying whether the user is at the credentials part or profile part of the form
  const [currentPart, setCurrentPart] = useState(0);
  //const [presentCareer, setPresentCareer] = useState<boolean>([false]);

  //for preventing double click
  const [disableGoNext, setDisableGoNext] = useState(false);
  const [disableGoBack, setDisableGoBack] = useState(false);
  const [alumImage, setImage] = useState<File | null>(null); // for alum photo

  const router = useRouter();
  const { user, isGoogleSignIn, logOut } = useAuth();

  // needed for the location-input component
  const [countryName, setCountryName] = useState<string>("");
  const [stateName, setStateName] = useState<string>("");

  const [isVerify, setIsVerify] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoadingModal, setIsLoadingModal] = useState(false);
  const [hasCurrentJob, setHasCurrentJob] = useState(false);

  function splitName(fullName: string | null | undefined) {
    if (!fullName) {
      return { firstName: "", lastName: "" };
    }
    const parts = fullName.trim().split(" ");
    const lastName = parts.pop(); // remove and get the last word
    const firstName = parts.join(" "); // join the rest back together
    return { firstName, lastName };
  }

  // create a react hook form
  // create the form definition using the signUpFormSchema
  const form = useForm<z.infer<typeof signUpFormSchema>>({
    // use zod and the form schema above for validation
    resolver: zodResolver(signUpFormSchema),
    // default values of the fields in the form
    defaultValues: {
      //email and password
      email: isGoogleSignIn ? user?.email ?? "" : "",
      password: isGoogleSignIn ? "googlesign" : "",
      passwordConfirm: isGoogleSignIn ? "googlesign" : "",

      //name
      firstName: isGoogleSignIn
        ? splitName(user?.displayName).firstName ?? ""
        : "",
      middleName: "",
      suffix: "",
      lastName: isGoogleSignIn
        ? splitName(user?.displayName).lastName ?? ""
        : "",

      //personal
      //birthday
      birthDate: "",

      //current home address
      address: ["", "", ""], //

      //education
      studentNumber: "",
      affiliation: [], //affiliation name, year joined, university
      fieldOfInterest: [],
      bachelors: [{ university: "", yearGraduated: "", major: "" }], //degree program, year graduated, university
      masters: [], //degree program, year graduated, university
      doctoral: [], //degree program, year graduated, university

      // //career
      currentJob: [],
      career: [], //industry, jobTitle, company, startYear, endYear
      acceptTerms: false,
      subscribeToNewsletter: false,
      contactPrivacy: false,
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

  //dynamic fields for currentJob
  const {
    fields: currentJob,
    append: addCurrentJob,
    remove: removeCurrentJob,
  } = useFieldArray({ control: form.control, name: "currentJob" });

  //dynamic fields for career
  const {
    fields: career,
    append: addCareer,
    remove: removeCareer,
  } = useFieldArray({ control: form.control, name: "career" });

  useEffect(() => {
    if (isVerified && !isVerify) {
    }
  }, [isVerified, isVerify]);

  useEffect(() => {
    if (isGoogleSignIn) {
      setCurrentPart(currentPart + 1);
      console.log(form);
    }
  }, []);

  // const handleInitiateSignUp = async () => {
  //   setIsLoading(true);
  //   setIsVerify(true); // This opens the verification modal
  // };

  const completeRegistration = async (
    data: z.infer<typeof signUpFormSchema>
  ) => {
    // setIsLoading(true);
    setIsLoadingModal(true);
    const response = await registerUser(
      data,
      {
        displayName: user?.displayName ?? "",
        email: user?.email ?? "",
        uid: user?.uid ?? "",
        photoURL: user?.photoURL ?? "",
      },
      isGoogleSignIn
    );
    setIsVerify(false);
    setIsLoadingModal(false);

    console.log("Testing sign-up:");
    console.log(data);
    console.log(alumImage);

    //display error or success toast message
    if (response?.error) {
      toastError(response.message);
      setIsLoading(false);
      return;
    }

    //upload alum photo to firebase storage
    if (alumImage) {
      uploadToFirebase(alumImage, response.alumniId!);
    }

    //uploading currentJob's proof of employment
    if (data.currentJob) {
      if (data.currentJob.length > 0) {
        if (data.currentJob[0].hasProof === true && response.workExperienceId) {
          uploadDocToFirebase(
            data.currentJob[0].proof,
            response.alumniId!,
            response.workExperienceId
          );
        }
      }
    }

    // if successful, show a dialog that says
    // wait for admin to approve the account
    setShowDialog(true);
  };

  //will enable the verification modal
  const handleSubmit = async () => {
    setIsLoading(true);

    setIsVerify(true);

    // if (isVerified && !isVerify) {
    //   console.log("putangin");
    //   const response = await registerUser(
    //     data,
    //     {
    //       displayName: user?.displayName ?? "",
    //       email: user?.email ?? "",
    //       uid: user?.uid ?? "",
    //       photoURL: user?.photoURL ?? "",
    //     },
    //     isGoogleSignIn
    //   );
    //   console.log("heyyy");

    //   console.log("Testing sign-up:");
    //   console.log(data);

    //   //display error or success toast message
    //   if (response?.error) {
    //     toastError(response.message);
    //     setIsLoading(false);
    //     return;
    //   }

    //   // if successful, show a dialog that says
    //   // wait for admin to approve the account
    //   setShowDialog(true);
    // } else {
    //   toastError("Verification failed");
    // }
  };

  type fieldName = keyof z.infer<typeof signUpFormSchema>;

  //callback for image upload
  const handleImageUpload = (image: File | null): void => {
    setImage(image);
    console.log("Uploaded image:", image);
  };

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
        setIsVerify(true);
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
      <div className="">
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault(); // prevent full-page reload
              if (currentPart === 0) {
                goNext();
              } else {
                form.handleSubmit(handleSubmit)(); // only submit when on final part
              }
            }}
          >
            <fieldset
              disabled={form.formState.isSubmitting || isLoading}
              className=""
            >
              {/*USER CREDENTIALS SECTION */}
              {currentPart === 0 && (
                <div className="flex h-screen bg-white">
                  <div className="flex w-[50%] justify-center items-center">
                    <div className="flex flex-col w-full mx-41 items-center">
                      <p className="text-5xl font-bold text-[#0856ba] pb-10">
                        Create an account
                      </p>

                      <div className="w-full px-8">
                        <div className="space-y-7 w-full">
                          <div className="flex flex-col gap-5">
                            <UserCredentials form={form}></UserCredentials>

                            <Button
                              type="button"
                              onClick={goNext}
                              disabled={disableGoNext}
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
                <div className="my-20">
                  {!isGoogleSignIn && (
                    <button
                      onClick={() => {
                        goBack();
                      }}
                      className="pl-45 italic hover:underline flex items-center justify-center space-x-5 col-span-6 text-[#0856ba] rounded-full cursor-pointer"
                    >
                      <ChevronLeft />
                      <p>Back</p>
                    </button>
                  )}

                  <div className="flex flex-col items-center mx-110">
                    <div className="space-y-10">
                      <div className="bg-white rounded-3xl p-10 space-y-15">
                        <div className="flex flex-col items-center">
                          <div className="bg-gray-300 w-50 h-50 flex justify-center items-center rounded-full overflow-hidden">
                            <AlumPhotoUpload
                              imageSetter={handleImageUpload}
                            ></AlumPhotoUpload>
                          </div>
                        </div>

                        <div className="space-y-7">
                          <div className="space-y-2">
                            <p className="font-bold text-xl">
                              Personal Information
                            </p>
                            <hr></hr>
                          </div>

                          {/* NAME AND PHOTO SECTION*/}
                          <NameAndPhoto form={form}></NameAndPhoto>

                          {/* PERSONAL SECTION */}
                          <Personal form={form}></Personal>
                        </div>

                        {/* EDUCATION SECTION */}
                        <div className="space-y-7">
                          <div className="space-y-2">
                            <p className="font-bold text-xl">
                              Educational Background
                            </p>
                            <hr></hr>
                            <p className="text-xs">
                              Kindly ensure that you include the degree you
                              obtained from UPLB ICS.
                            </p>
                          </div>

                          {/* studentNumber form field */}
                          <div className="grid grid-cols-12 gap-x-4 gap-y-3">
                            <div className="col-span-6">
                              <FormField
                                control={form.control}
                                name="studentNumber"
                                render={({ field }) => (
                                  <FormItem className="gap-0">
                                    <p className="text-sm font-semibold">
                                      Student Number at UPLB*
                                    </p>
                                    <FormControl>
                                      <Input
                                        placeholder="2020-12345"
                                        type="text"
                                        {...field}
                                        className="bg-white border border-gray-500"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          {/* field of interest field */}
                          {/* Field of Interest dropdown with multi-select (max 5) - Material UI implementation */}
                          <div className="">
                            <FormField
                              control={form.control}
                              name="fieldOfInterest"
                              render={({ field }) => (
                                <FormItem className="gap-0">
                                  <p className="text-sm font-semibold">
                                    Fields of Interest
                                  </p>
                                  <FormControl>
                                    <Autocomplete
                                      className="border border-gray-500 rounded-md"
                                      multiple
                                      id="field-of-interest"
                                      options={[
                                        "Artificial Intelligence (AI)",
                                        "Machine Learning (ML)",
                                        "Data Science",
                                        "Cybersecurity",
                                        "Software Engineering",
                                        "Computer Networks",
                                        "Computer Graphics and Visualization",
                                        "Human-Computer Interaction (HCI)",
                                        "Theoretical Computer Science",
                                        "Operating Systems",
                                        "Databases",
                                        "Web Development",
                                        "Mobile Development",
                                        "Cloud Computing",
                                        "Embedded Systems",
                                        "Robotics",
                                        "Game Development",
                                        "Quantum Computing",
                                        "DevOps and System Administration",
                                        "Information Systems",
                                        "Others"
                                      ]}
                                      value={field.value || []}
                                      onChange={(event, newValue) => {
                                        // Limit to maximum 5 selections
                                        if (newValue.length <= 5) {
                                          field.onChange(newValue);
                                        }
                                      }}
                                      renderInput={(params) => (
                                        <TextField
                                          {...params}
                                          placeholder={field.value?.length > 0 ? "" : "Select your fields of interest"}
                                          InputProps={{
                                            ...params.InputProps,
                                            style: { padding: 3 }
                                          }}
                                          inputProps={{
                                            ...params.inputProps,
                                            style: { padding: '3px 9px' }
                                          }}
                                          sx={{
                                            '& .MuiOutlinedInput-notchedOutline': {
                                              border: 'none',
                                              borderRadius: '5px'
                                            }
                                          }}
                                        />
                                      )}
                                    />
                                  </FormControl>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {(field.value?.length || 0)}/5 selected &nbsp;&nbsp; Max: 5
                                  </p>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          {/* <div className="">
                            <FormField
                              control={form.control}
                              name="fieldOfInterest"
                              render={({ field }) => (
                                <FormItem className="gap-0">
                                  <p className="text-sm font-semibold">
                                    Field of Interest
                                  </p>
                                  <FormControl>
                                    <TagsInput
                                      value={field.value ?? []}
                                      onValueChange={field.onChange}
                                      placeholder="Enter your fields of interest"
                                      className="bg-white border border-gray-500"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div> */}

                          {/* bachelor's form field */}
                          <div>
                            <p className="text-sm font-semibold pb-2">
                              Bachelor&apos;s Degree*
                            </p>
                            {bachelors.map((bachelor, index) => (
                              <div key={bachelor.id} className="relative pb-5">
                                {index > 0 && (
                                  <button
                                    className="absolute top-1 right-2 text-gray-500 cursor-pointer hover:text-red-500"
                                    type="button"
                                    onClick={() => removeBachelors(index)}
                                  >
                                    <Trash2Icon className="w-4" />
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
                              className="flex items-center space-x-3 cursor-pointer group"
                              type="button"
                              onClick={() => {
                                addBachelors({
                                  university: "",
                                  yearGraduated: "",
                                  major: "",
                                });
                              }}
                            >
                              <PlusCircleIcon className="text-[#3675c5] rounded-full group-hover:bg-[#3675c5] group-hover:text-white" />
                              <p className="text-[#3675c5] text-sm group-hover:underline">
                                Add bachelor's degree
                              </p>
                            </button>
                          </div>

                          {/* master's form field */}
                          <div>
                            <p className="text-sm font-semibold pb-2">
                              Master&apos;s Degree
                            </p>
                            {masters.map((master, index) => (
                              <div key={master.id} className="relative pb-5">
                                <button
                                  className="absolute top-1 right-2 text-gray-500 cursor-pointer hover:text-red-500"
                                  type="button"
                                  onClick={() => removeMasters(index)}
                                >
                                  <Trash2Icon className="w-4" />
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
                              className="flex items-center space-x-3 cursor-pointer group"
                              type="button"
                              onClick={() => {
                                addMasters({
                                  university: "",
                                  yearGraduated: "",
                                  major: "",
                                });
                              }}
                            >
                              <PlusCircleIcon className="text-[#3675c5] rounded-full group-hover:bg-[#3675c5] group-hover:text-white" />
                              <p className="text-[#3675c5] text-sm group-hover:underline">
                                Add master's degree
                              </p>
                            </button>
                          </div>

                          {/* doctoral form field */}
                          <div className="mt-5">
                            <p className="text-sm font-semibold pb-2">
                              Doctoral Degree
                            </p>
                            {doctoral.map((doc, index) => (
                              <div key={doc.id} className="relative pb-5">
                                <button
                                  className="absolute top-1 right-2 text-gray-500 cursor-pointer hover:text-red-500"
                                  type="button"
                                  onClick={() => removeDoctoral(index)}
                                >
                                  <Trash2Icon className="w-4" />
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
                              className="flex items-center space-x-3 cursor-pointer group"
                              type="button"
                              onClick={() => {
                                addDoctoral({
                                  university: "",
                                  yearGraduated: "",
                                  major: "",
                                });
                              }}
                            >
                              <PlusCircleIcon className="text-[#3675c5] rounded-full group-hover:bg-[#3675c5] group-hover:text-white" />
                              <p className="text-[#3675c5] text-sm group-hover:underline">
                                Add doctoral degree
                              </p>
                            </button>
                          </div>

                          {/* affiliations form field */}
                          <div className="mt-5">
                            <p className="text-sm font-semibold pb-2">
                              Affiliation
                            </p>
                            {affiliation.map((aff, index) => (
                              <div key={aff.id} className="relative pb-5">
                                <button
                                  className="absolute top-1 right-2 text-gray-500 cursor-pointer hover:text-red-500"
                                  type="button"
                                  onClick={() => removeAffiliation(index)}
                                >
                                  <Trash2Icon className="w-4" />
                                </button>

                                <Affiliation
                                  index={index}
                                  form={form}
                                ></Affiliation>
                              </div>
                            ))}

                            {/*add  fields button */}
                            <button
                              className="flex items-center space-x-3 cursor-pointer group"
                              type="button"
                              onClick={() => {
                                addAffiliations({
                                  university: "",
                                  yearJoined: "",
                                  affiliationName: "",
                                });
                              }}
                            >
                              <PlusCircleIcon className="text-[#3675c5] rounded-full group-hover:bg-[#3675c5] group-hover:text-white" />
                              <p className="text-[#3675c5] text-sm group-hover:underline">
                                Add affiliation
                              </p>
                            </button>
                          </div>
                        </div>

                        {/* CAREER SECTION */}
                        <div className="space-y-7">
                          <div className="space-y-2">
                            <p className="font-bold text-xl">Career</p>
                            <hr></hr>
                          </div>

                          {/*CURRENT JOB */}
                          <div className="mt-5">
                            <p className="text-sm font-semibold pb-2">
                              Current Job
                            </p>
                            {currentJob.map((car, index) => (
                              <div key={car.id} className="relative pb-5">
                                {/*remove field button */}
                                <button
                                  className="absolute top-1 right-2 text-gray-500 cursor-pointer hover:text-red-500"
                                  type="button"
                                  onClick={() => {
                                    removeCurrentJob(index);
                                    setHasCurrentJob(false);
                                  }}
                                >
                                  <Trash2Icon className="w-4" />
                                </button>

                                {/* career form field */}
                                <Career
                                  index={index}
                                  form={form}
                                  type={"currentJob"}
                                ></Career>
                              </div>
                            ))}
                            {/*add  fields button */}
                            {hasCurrentJob === false && (
                              <button
                                className="flex items-center space-x-3 cursor-pointer group"
                                type="button"
                                onClick={() => {
                                  addCurrentJob({
                                    industry: "",
                                    jobTitle: "",
                                    company: "",
                                    startYear: "",
                                    endYear: "present",
                                    location: "",
                                    latitude: 14.25,
                                    longitude: 121.25,
                                    hasProof: false,
                                    proof: null,
                                  });
                                  setHasCurrentJob(true);
                                }}
                              >
                                <PlusCircleIcon className="text-[#3675c5] rounded-full group-hover:bg-[#3675c5] group-hover:text-white" />
                                <p className="text-[#3675c5] text-sm group-hover:underline">
                                  Add current job
                                </p>
                              </button>
                            )}
                          </div>

                          {/*PAST WORK EXPERIENCE*/}
                          <div className="mt-5">
                            <p className="text-sm font-semibold pb-2">
                              Work Experience
                            </p>
                            {career.map((car, index) => (
                              <div key={car.id} className="relative pb-5">
                                {/*remove field button */}
                                <button
                                  className="absolute top-1 right-2 text-gray-500 cursor-pointer hover:text-red-500"
                                  type="button"
                                  onClick={() => removeCareer(index)}
                                >
                                  <Trash2Icon className="w-4" />
                                </button>

                                {/* career form field */}
                                <Career
                                  index={index}
                                  form={form}
                                  type={"career"}
                                ></Career>
                              </div>
                            ))}
                            {/*add  fields button */}
                            <button
                              className="flex items-center space-x-3 cursor-pointer group"
                              type="button"
                              onClick={() => {
                                addCareer({
                                  industry: "",
                                  jobTitle: "",
                                  company: "",
                                  startYear: "",
                                  endYear: "",
                                  location: "",
                                  latitude: 14.25,
                                  longitude: 121.25,
                                });
                              }}
                            >
                              <PlusCircleIcon className="text-[#3675c5] rounded-full group-hover:bg-[#3675c5] group-hover:text-white" />
                              <p className="text-[#3675c5] text-sm group-hover:underline">
                                Add work experience
                              </p>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 px-5">
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

                        {/* contactPrivacy form field */}
                        <div>
                          <FormField
                            control={form.control}
                            name="contactPrivacy"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex gap-2 justify-start items-center">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormLabel>
                                    <p>I consent to making my email address visible to other alumni.</p>
                                  </FormLabel>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <p className="font-light text-xs pl-6 pt-1">(You can change this preference later.)</p>
                        </div>

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
                                <FormLabel>
                                  Subscribe to our newsletter
                                </FormLabel>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                      </div>

                      <div className="flex flex-col items-start px-5">
                        <Button
                          className="w-50 col-span-6 bg-[#0856ba] text-white p-5 rounded-full cursor-pointer hover:bg-[#92b2dc]"
                          variant="outline"
                          type="submit"
                        >
                          Submit
                        </Button>
                      </div>
                    </div>
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
        onOpenChange={async (isOpen) => {
          setShowDialog(isOpen);
          // redirect the user after they manually close the dialog box
          if (isGoogleSignIn) {
            await logOut();
          } else if (!isOpen) {
            router.push("/");
          }
        }}
      >
        <DialogContent className="w-fit">
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
              <Button
                type="button"
                variant="secondary"
                className="cursor-pointer"
              >
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <VerificationCodeModal
        isOpen={isVerify}
        isCodeSent={isCodeSent}
        onClose={() => {
          setIsVerify(false);
          setIsLoading(false);
          setIsVerified(false);
        }}
        email={form.getValues("email") || user?.email || ""}
        onVerify={() => {
          setIsVerified(true);
          setIsLoading(true);

          completeRegistration(form.getValues());
        }}
        isLoadingModal={isLoadingModal}
        onCodeSent={() => setIsCodeSent(true)}
      />
    </>
  );
}
