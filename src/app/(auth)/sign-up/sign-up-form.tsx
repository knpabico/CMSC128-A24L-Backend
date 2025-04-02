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
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      passwordConfirm: "",
      studentNumber: "",
      currentLocation: ["", ""],
      employmentStatus: "",
      companyName: "",
      jobTitle: "",
      workField: "",
      workSetup: "",
      workLocation: ["", ""],
      techStack: [],
      skills: [],
      linkedinLink: "",
      githubLink: "",
      affiliations: [],
      acceptTerms: false,
      subscribeToNewsletter: false,
    },
  });

  // this variable will store the current value of the employmentStatus input field
  const employmentStatus = form.watch("employmentStatus");

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
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Juan" type="text" {...field} />
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
                          <FormLabel>Name</FormLabel>
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

                {/* display the SN and graduation year fields side by side */}
                <div className="grid grid-cols-12 gap-4">
                  {/* studentNumber form field */}
                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name="studentNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Student Number</FormLabel>
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

                  {/* graduationYear form field */}
                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name="graduationYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Graduation Year</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="2029"
                              type="number"
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

                {/* currentLocation form field */}
                <FormField
                  control={form.control}
                  name="currentLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Location</FormLabel>
                      <FormControl>
                        <LocationSelector
                          onCountryChange={(country) => {
                            setCountryName(country?.name || "");
                            form.setValue(field.name, [
                              country?.name || "",
                              stateName || "",
                            ]);
                            form.trigger(field.name);
                          }}
                          onStateChange={(state) => {
                            setStateName(state?.name || "");
                            form.setValue(field.name, [
                              form.getValues(field.name)[0] || "",
                              state?.name || "",
                            ]);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* employment status form field */}
                <FormField
                  control={form.control}
                  name="employmentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employment Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select employment status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="employed">Employed</SelectItem>
                          <SelectItem value="self-employed">
                            Self-employed
                          </SelectItem>
                          <SelectItem value="unemployed">Unemployed</SelectItem>
                          <SelectItem value="retired">Retired</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* conditionally render the companyName, jobTitle, workField, workSetup, and workLocation */}
                {/* depending on the chosen employmentStatus value */}
                {/* only show the following fields if user is not employed or retired */}
                {employmentStatus !== "" &&
                  employmentStatus !== "retired" &&
                  employmentStatus !== "unemployed" && (
                    <>
                      {/* company name form field */}
                      {/* hidden if self-employed */}
                      {employmentStatus !== "self-employed" && (
                        <FormField
                          control={form.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Google"
                                  type="text"
                                  {...field}
                                />
                              </FormControl>

                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {/* job title form field */}
                      <FormField
                        control={form.control}
                        name="jobTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Title</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Junior backend developer"
                                type="text"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* workField form field */}
                      <FormField
                        control={form.control}
                        name="workField"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Field of Work</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                      "justify-between",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value
                                      ? workFieldOptions.find(
                                          (workField) =>
                                            workField.value === field.value
                                        )?.label
                                      : "Select your field of work"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="p-0">
                                <Command>
                                  <CommandInput placeholder="Search work field..." />
                                  <CommandList>
                                    <CommandEmpty>
                                      No work field found.
                                    </CommandEmpty>
                                    <CommandGroup>
                                      {workFieldOptions.map((workField) => (
                                        <CommandItem
                                          value={workField.label}
                                          key={workField.value}
                                          onSelect={() => {
                                            form.setValue(
                                              "workField",
                                              workField.value
                                            );
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              workField.value === field.value
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                          {workField.label}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* workSetup form field */}
                      <FormField
                        control={form.control}
                        name="workSetup"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Work Setup</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select work setup" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="onsite">Onsite</SelectItem>
                                <SelectItem value="work-from-home">
                                  Work from home
                                </SelectItem>
                                <SelectItem value="hybrid">Hybrid</SelectItem>
                                <SelectItem value="remote">Remote</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* work location */}
                      {/* hidden if self-employed */}
                      {employmentStatus !== "self-employed" && (
                        <FormField
                          control={form.control}
                          name="workLocation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Work Location</FormLabel>
                              <FormControl>
                                <LocationSelector
                                  onCountryChange={(country) => {
                                    setCountryName(country?.name || "");
                                    form.setValue(field.name, [
                                      country?.name || "",
                                      stateName || "",
                                    ]);
                                    form.trigger(field.name);
                                  }}
                                  onStateChange={(state) => {
                                    setStateName(state?.name || "");
                                    form.setValue(field.name, [
                                      form.getValues(field.name)[0] || "",
                                      state?.name || "",
                                    ]);
                                  }}
                                />
                              </FormControl>

                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </>
                  )}

                {/* techStack form field */}
                <FormField
                  control={form.control}
                  name="techStack"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tech Stack</FormLabel>
                      <FormControl>
                        <MultiSelector
                          values={field.value}
                          onValuesChange={field.onChange}
                          loop
                        >
                          <MultiSelectorTrigger>
                            <MultiSelectorInput placeholder="Select technologies" />
                          </MultiSelectorTrigger>
                          <MultiSelectorContent>
                            <MultiSelectorList>
                              {techStackOptions.map((option, i) => (
                                <MultiSelectorItem key={i} value={option.label}>
                                  {option.label}
                                </MultiSelectorItem>
                              ))}
                            </MultiSelectorList>
                          </MultiSelectorContent>
                        </MultiSelector>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* skills form field */}
                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skills</FormLabel>
                      <FormControl>
                        <TagsInput
                          value={field.value ?? []}
                          onValueChange={field.onChange}
                          placeholder="Enter your skills"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* linkedinLink form field */}
                <FormField
                  control={form.control}
                  name="linkedinLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn Link</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://www.linkedin.com/in/juandelacruz"
                          type="text"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* githubLink form field */}
                <FormField
                  control={form.control}
                  name="githubLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub Link</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://github.com/juandelacruz"
                          type="text"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* affiliations form field */}
                <FormField
                  control={form.control}
                  name="affiliations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Affiliations</FormLabel>
                      <FormControl>
                        <TagsInput
                          value={field.value ?? []}
                          onValueChange={field.onChange}
                          placeholder="Enter your affiliations"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
