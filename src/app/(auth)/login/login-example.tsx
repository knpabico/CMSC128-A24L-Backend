import LoginForm from "./login-form";
import Image from "next/image";
import physciImage from "./physci.png";
import ICSARMSLogo from "../../../app/images/ICS_ARMS_logo_white.png";
import { MoveLeft } from "lucide-react";
import Link from "next/link";

export default function LoginExample() {
  return (
    <div className="flex min-h-screen bg-white">
      <div className="w-[50%] relative">
        <div className="fixed top-10 left-[5%] z-99">
          <Link href="/"  className="flex gap-2 items-center text-white text-[14px] hover:underline font-light">
            <MoveLeft size={18}/> Back
          </Link>
        </div>
        <Image src={physciImage} alt="hello" className="w-full h-full object-cover" layout="fill" />
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2  flex items-center justify-center">
          <Image
            src={ICSARMSLogo}
            alt="ICS ARMS Logo"
            className="shadow-xl"
            width={200}
            height={200}
          />
        </div> 
      </div>
      <div className="flex w-[50%] justify-center items-center">
        <LoginForm />
      </div>
    </div>
  );
}
