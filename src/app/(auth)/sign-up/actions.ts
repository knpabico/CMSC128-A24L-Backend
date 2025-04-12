"use server";

import { serverAuth, serverFirestoreDB } from "@/lib/firebase/serverSDK";
import { signUpFormSchema } from "@/validation/auth/sign-up-form-schema";
import { z } from "zod";

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
        ...alumnusData,
        alumniId: userCredential.uid,
        regStatus: "pending",
        createdDate: new Date(),
        activeStatus: "true",
      });
  } catch (err: any) {
    return {
      error: true,
      message: err.message ?? "Could not register user",
    };
  }
};
