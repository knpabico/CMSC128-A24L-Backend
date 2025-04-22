"use server";

import { serverAuth, serverFirestoreDB } from "@/lib/firebase/serverSDK";
import { signUpFormSchema } from "@/validation/auth/sign-up-form-schema";
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

export const registerUser = async (data: z.infer<typeof signUpFormSchema>) => {
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
  const { password, passwordConfirm, ...alumData } = alumnusData;
  try {
    // create a user in firebase auth
    const userCredential = await serverAuth.createUser({
      displayName: `${data.firstName} ${data.lastName}`,
      email: data.email,
      password: data.password,
    });

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
      .doc(userCredential.uid)
      .set({
        ...alumData,
        alumniId: userCredential.uid,
        regStatus: "pending",
        createdDate: new Date(),
        activeStatus: "false",
        age: calculateAge(new Date(alumnusData.birthDate)),
        birthDate: new Date(alumnusData.birthDate),
        address:
          alumnusData.currentLocation[1] !== ""
            ? [
                `${alumnusData.currentLocation[1]}, ${alumnusData.currentLocation[0]}`,
              ]
            : [`${alumnusData.currentLocation[0]}`],
      });
  } catch (err: any) {
    return {
      error: true,
      message: err.message ?? "Could not register user",
    };
  }
};
