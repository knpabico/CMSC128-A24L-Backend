"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { toastError } from "@/components/ui/sonner";
import { useAuth } from "@/context/AuthContext";
import { auth, db } from "@/lib/firebase";
import { Alumnus } from "@/models/models";
import { LoginFormSchema } from "@/validation/auth/login-form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import googleImage from "./google.png";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGoogle } = useAuth();
  const router = useRouter();

  // create a react hook form
  // create the form definition using the LoginFormSchema
  const form = useForm<z.infer<typeof LoginFormSchema>>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof LoginFormSchema>) => {
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, data.email, data.password).then(
        async (userCredentials) => {
          //get alum data from the "alumni" collection
          const alumniRef = doc(db, "alumni", userCredentials.user.uid);
          const alumniDoc = await getDoc(alumniRef);

          //check if alum document exists in firestore
          if (alumniDoc.exists()) {
            const alum = alumniDoc.data() as Alumnus;
            //if regStatus is approved, update lastLogin and activeStatus
            if (alum.regStatus === "approved") {
              //add lastLogin and set to current date
              await updateDoc(alumniRef, {
                lastLogin: new Date(),
                activeStatus: true,
              });
            }
          } else {
            console.log("Alum does not exist!");
          }
        }
      );
      // refresh the page, middleware runs
      // if user is logged in, then middleware will redirect the user to another page
      // router.refresh();
      router.push("/");
    } catch (err: any) {
      const errorMessage =
        err.code === "auth/invalid-credential"
          ? "The email or password you entered is incorrect. Please try again."
          : "An error occurred";

      toastError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const data = await signInWithGoogle();
    setIsLoading(!data);
  };

  return (
    <div className="flex flex-col w-full mx-49 items-center">
      <p className="text-5xl font-bold text-[var(--primary-blue)] pb-10">
        Welcome back!
      </p>

      <div className="space-y-7 w-full">
        <div className="text-[var(--primary-blue)] ">
          <button
            onClick={() => {
              handleGoogleSignIn();
            }}
            className="border-2 border-[var(--primary-blue)] hover:bg-gray-100 flex justify-center items-center p-2 rounded-full space-x-3 cursor-pointer w-full"
          >
            <Image src={googleImage} alt="hello" className="w-6 h-6" />
            <p className="">Sign in with Google</p>
          </button>
        </div>

        <hr></hr>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="w-full">
            <fieldset
              disabled={form.formState.isSubmitting || isLoading}
              className="flex flex-col gap-5"
            >
              {/* email form field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="ics@up.edu.ph" {...field} />
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

              <Button
                type="submit"
                disabled={form.formState.isSubmitting || isLoading}
                className="bg-[var(--primary-blue)] text-white p-3 rounded-full cursor-pointer hover:bg-[var(--blue-600)]"
              >
                Log in
              </Button>
            </fieldset>
          </form>
        </Form>

        <div className="flex justify-center items-center space-x-2 text-[14px]">
          <p>No account yet?</p>
          <button className="hover:underline text-[var(--primary-blue)]">
            <Link href="/sign-up">Sign up</Link>
          </button>
        </div>
      </div>
    </div>
  );
}
