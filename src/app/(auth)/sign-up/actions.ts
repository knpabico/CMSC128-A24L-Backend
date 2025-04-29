"use server";

import { serverAuth, serverFirestoreDB } from "@/lib/firebase/serverSDK";
import { Education, WorkExperience } from "@/models/models";
import { signUpFormSchema } from "@/validation/auth/sign-up-form-schema";
import { ErrorBoundaryHandler } from "next/dist/client/components/error-boundary";
import { UserRecord } from "firebase-admin/auth";
import { User } from "firebase/auth";
import { z } from "zod";
import { uploadToFirebase } from "./sign-up-fields/alum_photo";
import { uploadDocToFirebase } from "./sign-up-fields/career_proof";

//for checking if the email used in sign-up already exists in firebase auth
export const validateFirebaseEmail = async (email: string) => {
  try {
    const snapshot = await serverFirestoreDB
      .collection("alumni")
      .where("email", "==", email)
      .get();
    const snapshot1 = await serverFirestoreDB
      .collection("admin")
      .where("email", "==", email)
      .get();

    return snapshot.empty && snapshot1.empty; // true = email not found, false = email exists
  } catch (error) {
    console.error("Error checking email in Firestore:", error);
    return false;
  }
};
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

//function for saving career to the work_experience collection
const saveCareer = async (
  career:
    | (
        | {
            industry: string;
            jobTitle: string;
            company: string;
            startYear: string;
            endYear: string;
            presentJob: boolean;
          }
        | undefined
      )[]
    | undefined,
  alumniId: string,
  proofOfEmployment: any
) => {
  let workExperienceId = null;
  //if career exists
  if (career) {
    //loop for storing each career entry to work_experience
    for (let i = 0; i < career.length; i++) {
      if (career[i]) {
        //if career[i] is not undefined
        //each field shouldn't be empty

        //will contain the id to be used for adding education entry
        let ref = serverFirestoreDB.collection("work_experience").doc();

        //destructure to get presentJob
        const { presentJob, endYear, ...car } = career[i]!;

        await serverFirestoreDB
          .collection("work_experience")
          .doc(ref.id)
          .set({
            ...car,
            workExperienceId: ref.id,
            alumniId: alumniId,
            endYear: presentJob ? "present" : endYear, //if present job, set as present
            //dadagdag yung sa location, latitude, longitude, proofOfEmployment
          });

        if (presentJob) {
          workExperienceId = ref.id;
        }
      }
    }
  }

  //return id of current job
  return workExperienceId;
};

//function for saving bachelors, masters, and doctoral to the education collection
const saveEducation = async (
  bachelors: { university: string; major: string; yearGraduated: string }[],
  masters:
    | (
        | { university: string; major: string; yearGraduated: string }
        | undefined
      )[]
    | undefined,
  doctoral:
    | (
        | { university: string; major: string; yearGraduated: string }
        | undefined
      )[]
    | undefined,
  alumniId: string
) => {
  //loop for adding each bachelors to the education collection
  for (let i = 0; i < bachelors.length; i++) {
    //will contain the id to be used for adding education entry
    let bach = serverFirestoreDB.collection("education").doc();

    //add entry
    await serverFirestoreDB
      .collection("education")
      .doc(bach.id)
      .set({
        educationId: bach.id,
        alumniId: alumniId,
        ...bachelors[i],
        type: "bachelors",
      });
  }

  //if masters exist
  if (masters) {
    //loop for adding each masters to the education collection
    for (let i = 0; i < masters.length; i++) {
      //if current masters entry is not undefined, add to firestore
      if (masters[i]) {
        //will contain the id to be used for adding education entry
        let ref = serverFirestoreDB.collection("education").doc();

        await serverFirestoreDB
          .collection("education")
          .doc(ref.id)
          .set({
            educationId: ref.id,
            alumniId: alumniId,
            ...masters[i],
            type: "masters",
          });
      }
    }
  }

  //if doctoral exists
  if (doctoral) {
    //loop for adding each doctoral to the education collection
    for (let i = 0; i < doctoral.length; i++) {
      //if current doctoral entry is not undefined, add to firestore
      if (doctoral[i]) {
        //will contain the id to be used for adding education entry
        let ref = serverFirestoreDB.collection("education").doc();

        await serverFirestoreDB
          .collection("education")
          .doc(ref.id)
          .set({
            educationId: ref.id,
            alumniId: alumniId,
            ...doctoral[i],
            type: "doctoral",
          });
      }
    }
  }
};

//function for saving affiliations to the affiliation collection
const saveAffiliation = async (
  affiliation:
    | (
        | {
            affiliationName: string;
            yearJoined: string;
            university: string;
          }
        | undefined
      )[]
    | undefined,
  alumniId: string
) => {
  //if career exists
  if (affiliation) {
    //loop for storing each career entry to work_experience
    for (let i = 0; i < affiliation.length; i++) {
      if (affiliation[i]) {
        //if career[i] is not undefined
        //each field shouldn't be empty

        //will contain the id to be used for adding education entry
        let ref = serverFirestoreDB.collection("affiliation").doc();

        await serverFirestoreDB
          .collection("affiliation")
          .doc(ref.id)
          .set({
            affiliationId: ref.id,
            alumniId: alumniId,
            ...affiliation[i],
          });
      }
    }
  }
};

export const registerUser = async (
  data: z.infer<typeof signUpFormSchema>,
  alumImage: any,
  proofOfEmployment: any,
  userInfo: {
    displayName: string;
    email: string;
    uid: string;
    photoURL: string;
  },
  isGoogleSignIn: boolean
) => {
  console.log("userCred: ", userInfo);
  // validate the data one more time in the server side
  const validation = await signUpFormSchema.safeParseAsync(data);

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
    affiliation,
    career,
    passwordConfirm,
    ...alumData
  } = alumnusData;
  try {
    // create a user in firebase auth
    let userCredential = userInfo;
    if (!isGoogleSignIn) {
      const userRecord = await serverAuth.createUser({
        displayName: `${data.firstName} ${data.lastName}`,
        email: data.email,
        password: data.password,
      });
      userCredential = {
        displayName: userRecord.displayName ?? "",
        email: userRecord.email ?? "", // Provide a fallback for undefined email
        uid: userRecord.uid,
        photoURL: userRecord.photoURL ?? "",
      };
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
        activeStatus: false,
        age: calculateAge(new Date(alumnusData.birthDate)),
        birthDate: new Date(alumnusData.birthDate),
        contactPrivacy: true, //if true, contact (email) should be private
        //dagdag image
      });

    //save education
    await saveEducation(bachelors!, masters!, doctoral!, userCredential.uid);

    //save career
    let workExperienceId = await saveCareer(
      career,
      userCredential.uid,
      proofOfEmployment
    );

    //save affiliation
    await saveAffiliation(affiliation, userCredential.uid);

    return {
      error: false,
      alumniId: userCredential.uid,
      workExperienceId: workExperienceId,
    };
  } catch (err: any) {
    return {
      error: true,
      message: err.message ?? "Could not register user",
    };
  }
};
