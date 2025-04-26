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
import { auth } from "@/lib/firebase";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
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
      await signInWithEmailAndPassword(auth, data.email, data.password);
      // refresh the page, middleware runs
      // if user is logged in, then middleware will redirect the user to another page
      // router.refresh();
      router.push('/');
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
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">Login</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
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
              >
                Submit
              </Button>
            </fieldset>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="justify-between items-center">
        <small>Don't have an account?</small>
        <Button asChild variant="outline">
          <Link href="/sign-up">Sign up</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
