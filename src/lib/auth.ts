import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export async function getUserRole(email: string | null) {
  try {
    const adminRef = collection(db, "admin");
    const adminQuery = query(adminRef, where("email", "==", email));
    const adminSnapshot = await getDocs(adminQuery);

    if (!adminSnapshot.empty) {
      return "admin";
    }

    const userRef = collection(db, "alumni");
    const userQuery = query(userRef, where("email", "==", email));
    const userSnapshot = await getDocs(userQuery);

    if (!userSnapshot.empty) {
      return "user";
    }

    return null;
  } catch (error) {
    console.error("Error checking user role:", error);
    return null;
  }
}
