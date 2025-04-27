"use server";

import { serverAuth, serverFirestoreDB } from "@/lib/firebase/serverSDK";
import { signUpFormSchema } from "@/validation/auth/sign-up-form-schema";
import { UserRecord } from "firebase-admin/auth";
import { User } from "firebase/auth";
import { z } from "zod";

//function for calculating age (year only) based from birthdate
const calculateAge = (birthDate: Date) => {
  //current date
  const current_date = new Date();
  const current_day = current_date.getDate();
  const current_month = current_date.getMonth();
  const current_year = current_date.getFullYear();

  //birthDate
  const day = birthDate.getDate();
  const month = birthDate.getMonth();
  const year = birthDate.getFullYear();

  let age = current_year - year;
  //if current day < day or current month < month
  if (current_day < day || current_month < month) {
    age = age - 1; //subtract 1 from age
  }

  return age;
};

const saveCareer = async (career: string[], alumniId: string) => {
  //each field shouldn't be empty
  if (career[0] !== "") {
    //will contain the id to be used for adding education entry
    let ref = serverFirestoreDB.collection("career").doc();

    await serverFirestoreDB.collection("career").doc(ref.id).set({
      careerId: ref.id,
      alumniId: alumniId,
      industry: career[0],
      jobTitle: career[1],
      company: career[2],
      startYear: career[3],
      endYear: career[4],
    });
  }
};

const saveEducation = async (
  bachelors: string[],
  masters: string[],
  doctoral: string[],
  alumniId: string
) => {
  //will contain the id to be used for adding education entry
  let bach = serverFirestoreDB.collection("education").doc();

  await serverFirestoreDB.collection("education").doc(bach.id).set({
    educationId: bach.id,
    alumniId: alumniId,
    major: bachelors[0],
    yearGraduated: bachelors[1],
    university: bachelors[2],
    type: "bachelors",
  });

  //each field shouldn't be empty
  if (masters[0] !== "" && masters[1] !== "" && masters[2] !== "") {
    //will contain the id to be used for adding education entry
    let ref = serverFirestoreDB.collection("education").doc();

    await serverFirestoreDB.collection("education").doc(ref.id).set({
      educationId: ref.id,
      alumniId: alumniId,
      major: masters[0],
      yearGraduated: masters[1],
      university: masters[2],
      type: "masters",
    });
  }

  //each field shouldn't be empty
  if (doctoral[0] !== "" && doctoral[1] !== "" && doctoral[2] !== "") {
    //will contain the id to be used for adding education entry
    let ref = serverFirestoreDB.collection("education").doc();

    await serverFirestoreDB.collection("education").doc(ref.id).set({
      educationId: ref.id,
      alumniId: alumniId,
      major: doctoral[0],
      yearGraduated: doctoral[1],
      university: doctoral[2],
      type: "doctoral",
    });
  }
};

export const registerUser = async (
  data: z.infer<typeof signUpFormSchema>,
  user: User | null,
  isGoogleSignIn: boolean
) => {
  console.log("userCred: ");
  // validate the data one more time in the server side
  const validation = signUpFormSchema.safeParse(data);

  // if it fails
  if (!validation.success) {
    return {
      error: true,
      message: validation.error.issues[0]?.message ?? "An error occurred",
    };
  }

  // destructure the data, remove the acceptTerms key-value pair
  const { acceptTerms, ...alumnusData } = data;

  //remove password fields (hindi dapat masama sa firestore)
  const {
    password,
    bachelors,
    masters,
    doctoral,
    career,
    passwordConfirm,
    ...alumData
  } = alumnusData;
  try {
    // create a user in firebase auth
    let userCredential: User | UserRecord | null = user;
    if (!isGoogleSignIn) {
      const userRecord = await serverAuth.createUser({
        displayName: `${data.firstName} ${data.lastName}`,
        email: data.email,
        password: data.password,
      });
      userCredential = userRecord;
    }

    // save the details of the user as a document in firestore database
    //update - 'yung userId sa firestore ginawang document id sa alumni collection
    // await serverFirestoreDB.collection("alumni").add({
    //   ...alumnusData,
    //   alumniId: userCredential.uid,
    //   regStatus: "pending",
    //   createdDate: new Date(),
    //   activeStatus: "true",
    // });
    await serverFirestoreDB
      .collection("alumni")
      .doc(userCredential?.uid ?? "")
      .set({
        ...alumData,
        alumniId: userCredential?.uid ?? "",
        regStatus: "pending",
        createdDate: new Date(),
        activeStatus: "false",
        age: calculateAge(new Date(alumnusData.birthDate)),
        birthDate: new Date(alumnusData.birthDate),
        address: [
          alumData.address[0],
          alumData.address[1],
          alumData.address[2],
        ],
      });

    //save education
    await saveEducation(
      bachelors!,
      masters!,
      doctoral!,
      userCredential?.uid ?? ""
    );

    //save career
    await saveCareer(career!, userCredential.uid);

    //save career
  } catch (err: any) {
    return {
      error: true,
      message: err.message ?? "Could not register user",
    };
  }
};
