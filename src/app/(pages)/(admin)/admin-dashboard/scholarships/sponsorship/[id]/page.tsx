// will show the following
// alum info
// student info
// scholarship info
// pdf
"use client"

import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SponsorshipDetails() {
	const router = useRouter();
	const manage = () => {
    router.push("/admin-dashboard/scholarships/sponsorship");
  };
	const home = () => {
    router.push("/admin-dashboard");
  };

	return (
		<>
			<div className="flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <div className="hover:text-blue-600 cursor-pointer" onClick={home}>
            Home
          </div>
          <div>
            <ChevronRight size={15} />
          </div>
          <div className="hover:text-blue-600 cursor-pointer" onClick={manage}>
            Manage Sponsorship
          </div>
          <div>
            <ChevronRight size={15} />
          </div>
          <div className="font-bold text-[var(--primary-blue)]">
            Student Name
          </div>
        </div>

				<div className="w-full">
					<div className="flex flex-col items-start gap-3 lg:flex-row lg:items-center lg:justify-between">
						<div className="font-bold text-3xl">
							Sponsorship Details
						</div>
					</div>
				</div>

				<div className="flex gap-5">
					<div className="bg-white flex flex-col rounded-2xl overflow-hidden w-full p-4">
						<div className="flex justify-between items-center mb-4">
							<div className="text-md font-medium flex items-center">
								Student Information
							</div>
						</div>
						<div className="space-y-3">
							<div className="flex flex-col">
								<span className="text-sm text-gray-500">Name: </span>
								<span className="font-medium"></span>
							</div>
							<div className="flex flex-col">
								<span className="text-sm text-gray-500">Email Address: </span>
								<span className="font-medium"></span>
							</div>
							<div className="flex flex-col">
								<span className="text-sm text-gray-500">Student Number: </span>
								<span className="font-medium"></span>
							</div>
							<div className="flex flex-col">
								<span className="text-sm text-gray-500">Background: </span>
								<span className="font-medium"></span>
							</div>
							<div className="flex flex-col">
								<span className="text-sm text-gray-500">Address: </span>
								<span className="font-medium"></span>
							</div>
						</div>
					</div>
					<div className="bg-white flex flex-col rounded-2xl overflow-hidden w-full p-4">
						<div className="flex justify-between items-center mb-4">
							<div className="text-md font-medium flex items-center">
								Alumni Information
							</div>
						</div>
						<div className="space-y-3">
							<div className="flex flex-col">
								<span className="text-sm text-gray-500">Name: </span>
								<span className="font-medium"></span>
							</div>
							<div className="flex flex-col">
								<span className="text-sm text-gray-500">Email Address: </span>
								<span className="font-medium"></span>
							</div>
							<div className="flex flex-col">
								<span className="text-sm text-gray-500">Address: </span>
								<span className="font-medium"></span>
							</div>
						</div>
					</div>
				</div>

				<div className="flex gap-5">
					<div className="bg-white flex flex-col rounded-2xl overflow-hidden w-full p-4">
						<div className="flex justify-between items-center mb-4">
							<div className="text-md font-medium flex items-center">
								Scholarship Information
							</div>
							<div className="text-md font-medium flex items-center">
								Status
							</div>
						</div>
						<div>
							PDF Viewer and download
						</div>
					</div>
				</div>
			</div>
		</>
	)
}