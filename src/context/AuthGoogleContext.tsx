import { db } from "@/lib/firebase";
import { Alumnus } from "@/models/models";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const provider = new GoogleAuthProvider();
const auth = getAuth();

export async function GoogleSign() {
  await signInWithPopup(auth, provider)
    .then(async (result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      //   const credential = GoogleAuthProvider.credentialFromResult(result);
      //   const token = credential.accessToken;

      // The signed-in user info.
      const user = result.user;
      console.log(user.email, user.displayName, user.uid);

      const alumniRef = doc(db, "alumni", user.uid);
      const alumniDoc = await getDoc(alumniRef);
      //listen to changes on the data
      if (alumniDoc.exists()) {
        console.log("Document data:", alumniDoc.data());
        const alumniCopy = alumniDoc.data() as Alumnus;

        //convert date format to YYY-MM-DD
        alumniCopy.birthDate = alumniDoc.data().birthDate
          ? alumniDoc
              .data()
              .birthDate.toDate()
              .toISOString()
              .slice(0, 10)
              .replaceAll("-", "/")
          : undefined;
        return { success: true, user, alumniCopy };
      } else {
        return { success: false, errorMessage: "User not found!" };
      }
      // IdP data available using getAdditionalUserInfo(result)
      // ...
    })
    .catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      //   const email = error.customData.email;
      //   // The AuthCredential type that was used.
      //   const credential = GoogleAuthProvider.credentialFromError(error);
      console.log(`${errorCode}`);
      console.log(`${errorMessage}`);
      return { success: false, errorMessage };
      // ...
    });
  return { success: false, errorMessage: "Unknown error!" };
}
