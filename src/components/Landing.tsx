"use client";

import React from "react";
import Carousel from "@/components/Carousel";
import { Button } from "@/components/ui/button";
import { Oswald } from "next/font/google";
import Link from "next/link";
import ICSARMSLogo from "../app/images/ICS_ARMS_logo.png";
import Image from "next/image";
import Carousel2 from "./Carousel2";

const oswald = Oswald({
	subsets: ["latin"],
	weight: ["200", "300", "400", "500", "600", "700"],
});

export default function Landing() {
	return (
		<div>
			<div className="bg-white w-screen fixed top-0 z-99">
				<div className=" flex justify-between items-center pl-[5%] pr-[5%] text-white p-4">
					
					<div className="text-[var(--primary-blue)] flex justify-center items-center gap-3">
						<div>
							<Image
								src={ICSARMSLogo}
								alt="ICS-ARMS Logo"
								width={60}
								height={60}
							/>
						</div>
						<div>
							<div className={`${oswald.className} text-[14px] font-light text-gray-500`}>
								Institute of Computer Science
							</div>
							<div className={`${oswald.className} text-[18px] mt-[-3px]`}>
								Alumni Relations Management System
							</div>
						</div>
					</div>
					<div>
						<div className="relative z-10">
							{/* Button */}
							<Link href="/login">
								<Button className="border-2 border-[var(--primary-blue)] hover:bg-[var(--blue-200)] text-[var(--primary-blue)] font-bold py-2 px-4 rounded-full cursor-pointer">
									Log In
								</Button>
							</Link>
						</div>
					</div>	
				</div>
			</div>

			<div className="bg-white h-screen w-full flex flex-col items-center justify-center gap-8 pt-5 overflow-hidden relative">
				{/* <div className="circlePosition w-[1000px] h-[500px] bg-[var(--blue-100)] rounded-full absolute z-1 top-[80%] left-[50%] translate-x-[-50%] translate-y-[-50%] blur-[200px]"></div> */}
				{/* <div className="circlePosition w-[700px] h-[500px] bg-[var(--blue-100)] rounded-full absolute z-1 top-[30%] left-[80%] translate-x-[-50%] translate-y-[-50%] blur-[250px]"></div> */}

				{/* Logo */}
				<div className=" flex justify-center items-center gap-5 relative z-10">
					
					{/* <div className={`${oswald.className}`}>
						<div>
							Institute of Computer Science
						</div>
						<div className="text-2xl">
							Alumni Relations<br></br>Management System
						</div>
					</div> */}
				</div>

				{/* <div>
				<Image
								src={ICSARMSLogo}
								alt="ICS-ARMS Logo"
								width={120}
								height={120}
							/>
				</div> */}

				{/* Heading */}
				<div className={`${oswald.className} text-5xl text-[var(--blue-600)] relative z-10`}>
					Extending Our Reach, Embracing Our Legacy
				</div>

				{/* Subheading */}
				<div className="text-center relative z-10 text-md">
					ICS-ARMS reaches out to connect, support, and celebrate the
					journeys<br></br>of our alumni—building a stronger, united ICS
					community.
				</div>

				<div className="relative z-10">
					{/* Button */}
					<Link href="/login">
						<Button className="bg-[var(--primary-blue)] hover:bg-[var(--blue-600)] text-white font-bold py-2 px-4 rounded-full cursor-pointer">
							Get Started
						</Button>
					</Link>
				</div>

				<div className="relative z-10">
					<Carousel2 />
				</div>

			</div>
		</div>
	);
}