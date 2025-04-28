import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCNWvYDZUiko1aKNJkAQ7OnIVTO8au7LhU",
  authDomain: "cmsc-128-a24l.firebaseapp.com",
  projectId: "cmsc-128-a24l",
  storageBucket: "cmsc-128-a24l.firebasestorage.app",
  messagingSenderId: "1043705245663",
  appId: "1:1043705245663:web:31267f0e37776547e0de6a",
  measurementId: "G-HLWK3DNR6H",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
