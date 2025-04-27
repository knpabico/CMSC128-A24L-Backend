import { db } from "@/lib/firebase";
import { Alumnus } from "@/models/models";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const provider = new GoogleAuthProvider();
const auth = getAuth();

export async function GoogleSign() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log(user);
    console.log(user.email, user.displayName, user.uid);

    const alumniRef = doc(db, "alumni", user.uid);
    const alumniDoc = await getDoc(alumniRef);

    if (alumniDoc.exists()) {
      console.log("Document data:", alumniDoc.data());
      const alumniCopy = alumniDoc.data() as Alumnus;

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
      console.log("Hindi pa nageexist");
      return { success: false, errorMessage: "User not found!" };
    }
  } catch (error: any) {
    console.log(error.code);
    console.log(error.message);
    return { success: false, errorMessage: error.message };
  }
}
