"use client";

import Image from "next/image";

import UPLBLogo from "../app/images/UP_logo.png";
import CASLogo from "../app/images/CAS_logo.png";
import ICSOriginalLogo from "../app/images/ICS_logo.png";
import ICSNewLogo from "../app/images/ICS_new_logo.png";
import ICSARMSLogo from "../app/images/ICS_ARMS_logo.png";
import { Oswald } from "next/font/google";
import { Mail, MapPin, Phone } from "lucide-react";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
});

export default function Footer() {
  return (
    <div>
      <div className="bg-white flex justify-center items-center bg-whit p-15 gap-5 pl-[15%] pr-[15%] text-xs">
        <div className="   w-1/2 flex flex-col gap-5">
          <div>
            <div className={`${oswald.className} text-[16px] font-light text-gray-600`}>
              Institute of Computer Science
            </div>
            <div className={`${oswald.className} text-[20px] mt-[-3px] text-[var(--primary-blue)]`}>
              Alumni Relations Management System
            </div>
          </div>

          <div className="h-[0.5px] w-[90%] bg-gray-400"></div>

          <div className="flex flex-col gap-1 text-[var(--blue-900)] ">
            <div className="flex gap-1 ">
              <div className="flex items-center"><Mail size={14}/></div>
              <div className="flex items-center">
                ics.uplb@up.edu.ph
              </div>
            </div>

            <div className="flex gap-1 ">
              <div className="flex items-center"><Phone size={14}/></div>
              <div className="flex items-center">
                (049) 536 2302 | 63-49-536-2302
              </div>
            </div>

            <div className="flex gap-1 ">
              <div className="flex items-center"><MapPin size={14}/></div>
              <div className="flex items-center">
                College of Arts and Sciences, UPLB Los Baños Laguna, Philippines 4031
              </div>
            </div>
          </div>

        </div>
        <div className=" w-1/2  flex flex-col gap-3">
          <div className=" flex justify-end items-center gap-4">
            <div className="">
              <Image
                src={ICSARMSLogo}
                alt="ICS-ARMS Logo"
                width={80}
                height={80}
              />
            </div>

            <div className="">
              <Image
                src={ICSNewLogo}
                alt="ICS Reimagined Logo"
                width={90}
                height={90}
              />
            </div>

            <div className="">
              <Image
                src={ICSOriginalLogo}
                alt="ICS Logo"
                width={85}
                height={85}
              />
            </div>

            <div className="">
              <Image
                src={CASLogo}
                alt="CAS Logo"
                width={85}
                height={85}
              />
            </div>

            <div className="">
              <Image
                src={UPLBLogo}
                alt="UPLB Logo"
                width={85}
                height={85}
              />
            </div>
            
            
          </div>
          
        </div>
      </div>

      <div className="flex items-center justify-center p-3 text-xs bg-[var(--primary-blue)] text-white">
        Copyright All Rights Reserved &copy; 2025
      </div>
    </div>
  );
}