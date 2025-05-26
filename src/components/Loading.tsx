import Image from "next/image";
import ICSARMSLogo from "../app/images/ICS_ARMS_logo.png";

export default function LoadingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <title>ICS-ARMS</title>
      <Image
        src={ICSARMSLogo}
        alt="ICS ARMS Logo"
        className="w-32 h-32 mb-4 animate-pulse"
        width={128}
        height={128}
      />
    </div>
  );
}
