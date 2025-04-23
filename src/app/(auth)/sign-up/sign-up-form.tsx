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
import { useForm } from "react-hook-form";
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

export default function RegistrationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const router = useRouter();

  // needed for the location-input component
  const [countryName, setCountryName] = useState<string>("");
  const [stateName, setStateName] = useState<string>("");

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
      affiliation: ["", "", ""], //affiliation name, year joined, university
      bachelors: ["", "", ""], //degree program, year graduated, university
      masters: ["", "", ""], //degree program, year graduated, university
      doctoral: ["", "", ""], //degree program, year graduated, university

      // //career
      career: ["", "", "", "", ""], //industry, jobTitle, company, startYear, endYear

      acceptTerms: false,
      subscribeToNewsletter: false,
    },
  });

  const handleSubmit = async (data: z.infer<typeof signUpFormSchema>) => {
    setIsLoading(true);
    const response = await registerUser(data);

    // display error or success toast message
    if (response?.error) {
      toastError(response.message);
      setIsLoading(false);
      return;
    }

    // if successful, show a dialog that says
    // wait for admin to approve the account
    setShowDialog(true);
  };

  return (
    // shadcn/ui form docs: https://ui.shadcn.com/docs/components/form
    // create the UI of the form
    <>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Sign Up</CardTitle>
        </CardHeader>
        <CardContent>
          {/* spread the react hook form instance  into the shadcn ui Form component */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <fieldset
                disabled={form.formState.isSubmitting || isLoading}
                className="flex flex-col gap-5"
              >
                {/* name form fields */}
                <div className="grid grid-cols-12 gap-4">
                  {/* first name form field */}
                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Juan" type="text" {...field} />
                          </FormControl>
                          {/* FormMessage is used for displaying validation error message */}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* middle name form field */}
                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name="middleName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Middle Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Martinez"
                              type="text"
                              {...field}
                            />
                          </FormControl>
                          {/* FormMessage is used for displaying validation error message */}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* last name form field */}
                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Dela Cruz"
                              type="text"
                              {...field}
                            />
                          </FormControl>
                          {/* FormMessage is used for displaying validation error message */}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* last name form field */}
                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name="suffix"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Suffix</FormLabel>
                          <FormControl>
                            <Input placeholder="Jr." type="text" {...field} />
                          </FormControl>
                          {/* FormMessage is used for displaying validation error message */}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* birthDate form field */}
                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Birthday</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              // we will not provide a default value to this input field
                              // that requires a number value when we create the react hook form (the form variable above)
                              // Instead, if the value of it is undefined initially, then we set
                              // it to an empty string here
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* address form field */}

                <div className="grid grid-cols-12 gap-4">
                  {/* country */}
                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name="address.0"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Home Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Country" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {/* city/municipality */}
                  <div className="col-span-6 mt-5">
                    <FormField
                      control={form.control}
                      name="address.1"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="City/Municipality" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-6">
                    {/* province/state */}
                    <FormField
                      control={form.control}
                      name="address.2"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Province/State" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* email form field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="juandelacruz@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* password form field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <PasswordInput placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* passwordConfirm form field */}
                <FormField
                  control={form.control}
                  name="passwordConfirm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <PasswordInput placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* display the SN field*/}
                <div className="grid grid-cols-12 gap-4">
                  {/* studentNumber form field */}
                  <div className="col-span-12">
                    <FormField
                      control={form.control}
                      name="studentNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Student Number at UPLB</FormLabel>
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

                <div className="grid grid-cols-12 gap-4">
                  {/* affiliation name */}
                  <div className="col-span-7">
                    <FormField
                      control={form.control}
                      name="affiliation.0"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Affiliation</FormLabel>
                          <FormControl>
                            <Input placeholder="Affiliation Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {/* year joined */}
                  <div className="col-span-5 mt-5">
                    <FormField
                      control={form.control}
                      name="affiliation.1"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Year Joined" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-12">
                    {/* university */}
                    <FormField
                      control={form.control}
                      name="affiliation.2"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="University" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* bachelor's form field */}

                <div className="grid grid-cols-12 gap-4">
                  {/* degree program */}
                  <div className="col-span-7">
                    <FormField
                      control={form.control}
                      name="bachelors.0"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bachelor's Degree</FormLabel>
                          <FormControl>
                            <Input placeholder="Degree Program" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {/* year graduated */}
                  <div className="col-span-5 mt-5">
                    <FormField
                      control={form.control}
                      name="bachelors.1"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Year Graduated" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-12">
                    {/* university */}
                    <FormField
                      control={form.control}
                      name="bachelors.2"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="University" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* master's form field */}

                <div className="grid grid-cols-12 gap-4">
                  {/* degree program */}
                  <div className="col-span-7">
                    <FormField
                      control={form.control}
                      name="masters.0"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Master's Degree</FormLabel>
                          <FormControl>
                            <Input placeholder="Degree Program" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {/* year graduated */}
                  <div className="col-span-5 mt-5">
                    <FormField
                      control={form.control}
                      name="masters.1"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Year Graduated" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-12">
                    {/* university */}
                    <FormField
                      control={form.control}
                      name="masters.2"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="University" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* doctoral form field */}
                <div className="grid grid-cols-12 gap-4">
                  {/* degree program */}
                  <div className="col-span-7">
                    <FormField
                      control={form.control}
                      name="doctoral.0"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Doctoral Degree</FormLabel>
                          <FormControl>
                            <Input placeholder="Degree Program" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {/* year graduated */}
                  <div className="col-span-5 mt-5">
                    <FormField
                      control={form.control}
                      name="doctoral.1"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Year Graduated" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-12">
                    {/* university */}
                    <FormField
                      control={form.control}
                      name="doctoral.2"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="University" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* career form field */}

                <div className="grid grid-cols-12 gap-4">
                  {/* industry */}
                  <div className="col-span-4">
                    <FormField
                      control={form.control}
                      name="career.0"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry</FormLabel>
                          <FormControl>
                            <Input placeholder="Industry" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {/* year graduated */}
                  <div className="col-span-8">
                    <FormField
                      control={form.control}
                      name="career.1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Job Title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-12">
                    {/* university */}
                    <FormField
                      control={form.control}
                      name="career.2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company/Organization</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Company/Organization"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-6">
                    {/* start year */}
                    <FormField
                      control={form.control}
                      name="career.3"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Year</FormLabel>
                          <FormControl>
                            <Input placeholder="Start Year" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-6">
                    {/* end year */}
                    <FormField
                      control={form.control}
                      name="career.4"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Year</FormLabel>
                          <FormControl>
                            <Input placeholder="End Year" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
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

                {/* submit button */}
                <Button type="submit">SIGN UP</Button>
              </fieldset>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="justify-between items-center">
          <small>Already have an account?</small>
          <Button
            asChild
            variant="outline"
            disabled={form.formState.isSubmitting || isLoading}
          >
            <Link href="/login">Login</Link>
          </Button>
        </CardFooter>
      </Card>

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
