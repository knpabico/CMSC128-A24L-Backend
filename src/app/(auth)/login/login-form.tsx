"use client";
import { LoginFormSchema } from "@/validation/auth/login-form-schema";
import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { toastError } from "@/components/ui/sonner";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import Image from "next/image";
import googleImage from "./google.png";
import { useAuth } from "@/context/AuthContext";
import { updateDoc, doc } from "firebase/firestore";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { alumInfo } = useAuth();

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
      await signInWithEmailAndPassword(auth, data.email, data.password);
      // refresh the page, middleware runs
      // if user is logged in, then middleware will redirect the user to another page
      // router.refresh();

      if (alumInfo?.activeStatus === true) {
        //set lastLogIn
        const userRef = doc(db, "alumni", alumInfo.alumniId);

        //add lastLogin and set to current date
        await updateDoc(userRef, { lastLogin: new Date() });
      }

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

  return (
    <div className="flex flex-col w-full mx-46 items-center">
      <p className="text-5xl font-bold text-[#0856ba] pb-10">Welcome back!</p>

      <div className="space-y-7 w-full">
        <button className="border-2 border-[#0856ba] flex justify-center items-center p-2 rounded-full space-x-3 cursor-pointer w-full hover:bg-[#92b2dc]">
          <Image src={googleImage} alt="hello" className="w-6 h-6" />
          <p className="text-[#0856ba]">Continue with Google</p>
        </button>

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

              <Button
                type="submit"
                disabled={form.formState.isSubmitting || isLoading}
                className="bg-[#0856ba] text-white p-3 rounded-full cursor-pointer hover:bg-[#92b2dc]"
              >
                Log in
              </Button>
            </fieldset>
          </form>
        </Form>

        <div className="flex justify-center items-center space-x-2">
          <p>No account yet?</p>
          <button className="hover:underline text-[#0856ba]">
            <Link href="/sign-up">Sign up</Link>
          </button>
        </div>
      </div>
    </div>
  );
}
