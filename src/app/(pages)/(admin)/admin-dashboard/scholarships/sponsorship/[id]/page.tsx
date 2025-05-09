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
			</div>
		</>
	)
}