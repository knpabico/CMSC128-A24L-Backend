"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Oswald } from "next/font/google";
import Link from "next/link";
import ICSARMSLogo from "../app/images/ICS_ARMS_logo.png";
import LandingBG from "../app/images/network-bg.png";
import Image from "next/image";
import Carousel2 from "./Carousel2";

const oswald = Oswald({
	subsets: ["latin"],
	weight: ["200", "300", "400", "500", "600", "700"],
});

export default function Landing() {
	return (
		<div>

			{/* Navbar */}
			<div className="bg-white w-screen fixed top-0 z-99 ">
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
							<Link href="/login">
								{/* <Button className="border-2 border-[var(--primary-blue)] hover:border-[var(--blue-600)] text-[var(--primary-blue)] font-bold py-2 px-4 rounded-full cursor-pointer"> */}
								<Button className="bg-[var(--blue-400)] hover:bg-[var(--primary-blue)] text-white font-bold py-2 px-4 rounded-full cursor-pointer">
									Log In
								</Button>
							</Link>
						</div>
					</div>	
				</div>
			</div>

			<div className="bg-white h-screen w-full flex flex-col items-center justify-center gap-3 pt-10 overflow-hidden relative">
				<div className="circlePosition w-screen h-[70%] bg-[var(--blue-100)] rounded-full absolute z-1 top-[95%] left-[50%] translate-x-[-50%] translate-y-[-50%] blur-[100px]"></div>
				{/* <div className="circlePosition w-[700px] h-[500px] bg-[var(--blue-100)] rounded-full absolute z-1 top-[30%] left-[80%] translate-x-[-50%] translate-y-[-50%] blur-[250px]"></div> */}
				<div>
					<Image
						src={LandingBG}
						alt="Background Image"
						width={1000}
						height={1000}
						className="absolute top-[-15] left-0 w-full h-full object-cover opacity-30 "
					/>
				</div>

				{/* Heading */}
				<div className={`${oswald.className} text-[52px] text-[var(--primary-blue)] relative z-10`}>
					Extending Our Reach, Embracing Our Legacy
				</div>

				{/* Subheading */}
				<div className="text-center relative z-10 text-md text-gray-800">
					ICS-ARMS reaches out to connect, support, and celebrate the
					journeys<br></br>of our alumni—building a stronger, united ICS
					community.
				</div>

				<div className="relative z-10 p-3">
					{/* Button */}
					<Link href="/login">
						{/* <Button className="bg-[var(--blue-400)] hover:bg-[var(--blue-600)] text-white font-bold py-2 px-4 rounded-full cursor-pointer"> */}
						<Button className="border-2 border-[var(--primary-blue)] text-[var(--primary-blue)] font-bold py-2 px-4 rounded-full cursor-pointer">
							Get Started
						</Button>
					</Link>
				</div>

				<div className="relative z-10 pt-2">
					<Carousel2 />
				</div>

			</div>
		</div>
	);
}