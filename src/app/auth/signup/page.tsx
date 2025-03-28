"use client";
import LoadingPage from "@/components/Loading";
import { useAlums } from "@/context/AlumContext";
import { useAuth } from "@/context/AuthContext";
import { Alumnus } from "@/models/models";
import { Box, Button, Stack, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignUp() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [address, setAddress] = useState<string[]>([]);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [age, setAge] = useState<number | null>(null);
  const [birthDate, setBirthdate] = useState<Date | null>(null);
  const [companyName, setCompanyName] = useState<string>("");
  const [jobTitle, setJobTitle] = useState<string>("");
  const [fieldOfWork, setFieldOfWork] = useState<string>("");
  const [graduationYear, setGraduationYear] = useState<string>("");
  const [affiliation, setAffiliations] = useState<string[]>([]);
  const [studentNumber, setStudentNumber] = useState<string>("");
  const [emailError, setEmailError] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<boolean>(false);
  const [confirmPasswordError, setConfirmPasswordError] =
    useState<boolean>(false);
  const upMail: RegExp = new RegExp(/^[a-zA-Z0-9._%+-]+@up\.edu\.ph$/);
  const { user, loading, signUp } = useAuth();
  const { addAlumnus } = useAlums();
  const route = useRouter();
  const handleSignup = async (password: string, alum: object) => {
    const newAlum: Alumnus = alum as Alumnus;
    try {
      const credentials = await signUp(newAlum.email, password);
      if (credentials != undefined) {
        console.log("user uid", credentials?.user.uid);
        const res = await addAlumnus(newAlum, credentials.user.uid);
        if (res.success) console.log("Added to firestore!");
        if (!res.success) console.log(res.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user) {
      route.replace("/");
    }
  }, [user, route]);

  if (loading || user) {
    return <LoadingPage />;
  }

  return (
    <div>
      <div className="flex flex-row min-h-screen justify-center items-center">
        <Box
          component={"form"}
          autoComplete="off"
          className="border-gray-400 border-2 pb-20 pt-20 pl-15 pr-15 rounded-[16px]"
        >
          <Stack direction={"column"} spacing={2}>
            <h1 className="text-black font-bold text-2xl text-center">
              Sign Up
            </h1>
            <TextField
              required
              label="Email"
              error={emailError}
              helperText={emailError ? "Please enter a valid UP mail" : ""}
              onChange={(e) => {
                setEmail(e.target.value);
                if (!upMail.test(e.target.value) || !e.target.validity.valid) {
                  setEmailError(true);
                } else setEmailError(false);
              }}
            />
            <TextField
              required
              fullWidth
              label="Password"
              type="password"
              error={passwordError}
              helperText={
                passwordError ? "Passwords should be at least 6 characters" : ""
              }
              onChange={(e) => {
                setPassword(e.target.value);
                if (e.target.value.length < 6) {
                  setPasswordError(true);
                } else setPasswordError(false);
              }}
            />
            <TextField
              required
              label="Confirm Password"
              type="password"
              error={confirmPasswordError}
              helperText={confirmPasswordError ? "Passwords do not match!" : ""}
              onChange={(e) => {
                if (e.target.value !== password) {
                  setConfirmPasswordError(true);
                } else setConfirmPasswordError(false);
              }}
            />
            <TextField
              required
              label="First Name"
              onChange={(e) => {
                setFirstName(e.target.value);
              }}
            />
            <TextField
              required
              label="Last Name"
              onChange={(e) => {
                setLastName(e.target.value);
              }}
            />
            <TextField
              required
              label="Age"
              onChange={(e) => {
                setAge(Number(e.target.value));
              }}
            />
            <TextField
              required
              label="Birthdate"
              onChange={(e) => {
                setBirthdate(new Date(e.target.value));
              }}
            />
            <TextField
              required
              label="Student Number"
              onChange={(e) => {
                setStudentNumber(e.target.value);
              }}
            />
            <TextField
              required
              label="Company Name"
              onChange={(e) => {
                setCompanyName(e.target.value);
              }}
            />
            <TextField
              required
              label="Job Title"
              onChange={(e) => {
                setJobTitle(e.target.value);
              }}
            />
            <TextField
              required
              label="Field of Work"
              onChange={(e) => {
                setFieldOfWork(e.target.value);
              }}
            />
            <TextField
              required
              label="Graduation Year"
              onChange={(e) => {
                setGraduationYear(e.target.value);
              }}
            />
            <TextField
              required
              label="Affiliation"
              onChange={(e) => {
                setAffiliations([e.target.value]);
              }}
            />
            <TextField
              required
              label="Address"
              onChange={(e) => {
                setAddress([e.target.value]);
              }}
            />
            <Button
              variant="contained"
              onClick={() => {
                handleSignup(password, {
                  email,
                  firstName,
                  lastName,
                  age,
                  birthDate,
                  studentNumber,
                  address,
                  companyName,
                  jobTitle,
                  fieldOfWork,
                  graduationYear,
                  affiliation,
                });
              }}
            >
              Sign Up
            </Button>
          </Stack>
        </Box>
      </div>
    </div>
  );
}
