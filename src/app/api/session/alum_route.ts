import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { doc, setDoc,getDocs, collection} from "firebase/firestore";
import { db } from "@/lib/firebase";

//this function will get all the list of alumni created by admin from the database
//will return a list of alumnis
export async function GET(){
    try{
      const querySnapshot = await getDocs(collection(db, "alumni"));
      const alumnilist = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return NextResponse.json({success: true, alumnis:alumnilist});
  
    }catch (error) {
      return NextResponse.json(
        { success: false, message: (error as Error).message },
        { status: 400 }
      );
    }
  }
  
//this function will add an alumni to the database
export async function POST(req: Request){
    try{
        const { token, alumniId, activeStatus, regStatus} = await req.json();
        if (!token)
            return NextResponse.json({ error: "Invalid Request: No token provided" }, { status: 400 });
        
        //Adding Alum
        const newAlumnusRef = doc(collection(db,"alumni",alumniId));
    
        const alumniData = {
            activeStatus: true,
            regStatus: "Pending",
            createdAt: new Date(),
          };
      
          await setDoc(newAlumnusRef, alumniData);    

          return NextResponse.json({ success: true, message: "Alumnus added", data: alumniData });
    } catch (error) {
          return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
    }
  }
  