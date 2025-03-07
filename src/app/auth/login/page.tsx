"use client";
import {
  Box,
  Button,
  FormControl,
  Snackbar,
  SnackbarContent,
  Stack,
  TextField,
} from "@mui/material";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingPage from "@/components/Loading";
import Link from "next/link";

export default function Login() {
  const { signIn, user, loading } = useAuth();
  const route = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [emailError, setEmailError] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [success, setSuccess] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log(`Email: ${email}\nPassword: ${password}`);
    const { success, message } = await signIn(email, password);
    setMessage(message);
    if (success) {
      setSuccess(true);
    } else {
      console.log(message);
      setError(true);
    }
  };

  useEffect(() => {
    if (user) {
      route.push("/");
    }
  }, [user, route]);

  if (loading || user) {
    return <LoadingPage />;
  }

  return (
    <div>
      <Snackbar
        open={error}
        autoHideDuration={3000}
        onClose={() => {
          setError(false);
        }}
      >
        <SnackbarContent style={{ backgroundColor: "red" }} message={message} />
      </Snackbar>

      <div className="flex flex-row min-h-screen justify-center items-center">
        <Box
          onSubmit={handleLogin}
          component={"form"}
          autoComplete="off"
          className="border-gray-400 border-2 pb-20 pt-20 pl-15 pr-15 rounded-[16px]"
        >
          <Stack direction={"column"} spacing={2}>
            <h1 className="text-black font-bold text-2xl text-center">
              Sign In
            </h1>
            <FormControl>
              <div className="p-2">
                <TextField
                  type="email"
                  required
                  label="Email"
                  error={emailError}
                  helperText={emailError ? "Please enter a valid email" : ""}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (!e.target.validity.valid) {
                      setEmailError(true);
                    } else setEmailError(false);
                  }}
                />
              </div>
              <div className="p-2">
                <TextField
                  required
                  label="Password"
                  type="password"
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                />
              </div>
              <Button type="submit" variant="contained">
                Sign In
              </Button>
            </FormControl>
          </Stack>
        </Box>
      </div>
    </div>
  );
}
