import LoginForm from "./login-form";
import Image from "next/image";
import physciImage from "./physci.png";

export default function LoginExample() {
  return (
    <div className="flex min-h-screen">
      <div className="w-[50%] relative">
        <Image src={physciImage} alt="hello" className="w-full h-full object-cover" layout="fill" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-70 h-70 rounded-full"></div> 
      </div>
      <div className="flex w-[50%] justify-center items-center">
        <LoginForm />
      </div>
    </div>
  );
}
