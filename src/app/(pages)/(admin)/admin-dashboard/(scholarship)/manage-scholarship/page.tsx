"use client";

import { Scholarship } from "@/models/models"
import { useScholarship } from "@/context/ScholarshipContext"
import React, { useState } from "react";
import { useRouter } from 'next/navigation';


export default function ManageScholarship(){
	const {
		scholarships,
		loading,
		error,
		addScholarship,
		updateScholarship,
		deleteScholarship,
		getScholarshipById
	} = useScholarship();

	const router  = useRouter();
	const navigateToDetail = (scholarshipId: string) => {
		router.push(`/admin-dashboard/manage-scholarship/${scholarshipId}`);
	}

	const [sortOption, setSortOption] = useState<"newest" | "oldest" | "number of sponsors (asc)" | "number of sponsors (dsc)">("newest");
	const sortScholarships = (scholarships: Scholarship[]) =>
		[...scholarships].sort((a, b) => {
			switch (sortOption) {
				case "oldest":
					return new Date(a.datePosted).getTime() - new Date(b.datePosted).getTime();
				case "newest":
					return new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime();
				case "number of sponsors (asc)":
					return a.alumList.length - b.alumList.length; // ascending = small to big
				case "number of sponsors (dsc)":
					return b.alumList.length - a.alumList.length; // descending = big to small
				default:
					return 0;
			}
		});
	const sortedScholarships = sortScholarships(scholarships);
	
	return (
		<div className="mx-20 my-30">
			<div>
				<h1 className="text-3xl font-medium">Manage Scholarships</h1>
			</div>
			<div className="bg-[#FFFFFF] rounded-[10px] px-5 py-1 flex justify-between items-center shadow-md border border-gray-200">
				<h2 className="text-md lg:text-lg font-semibold">All Donation Drives</h2>
				<div className="flex items-center">
					<label htmlFor="sort" className="mr-2 text-sm">Sort by:</label>
					<select id="sort" value={sortOption} onChange={(e) => setSortOption(e.target.value as any)} className="flex items-center text-sm" >
						<option value="newest">Newest</option>
						<option value="oldest">Oldest</option>
						<option value="number of sponsors (asc)">Number of Sponsors (ASC)</option>
						<option value="number of sponsors (dsc)">Number of Sponsors (DSC)</option>
					</select>
				</div>
			</div>
			{sortedScholarships.length === 0 ? (
				<div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow p-8">
					'No scholarships available.'
				</div>
			) : (
				<div className="flex flex-col gap-3 w-full">
					{sortedScholarships.map((scholarship : Scholarship) => (
					<div 
						key={scholarship.scholarshipId} 
						className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
						onClick={() => navigateToDetail(scholarship.scholarshipId)}
					>
						{/* Body */}
						<div className="px-6 py-3 flex justify-between items-center">
							{/* Details */}
							<div className="flex flex-col justify-start">
								<h2 className="text-xl font-semibold truncate">{scholarship.title}</h2>
								<p className="text-sm text-gray-600">
									Posted on {scholarship.datePosted.toLocaleDateString()}
								</p>
								<p className="text-sm text-gray-600">
									Total Number of Sponsors: {scholarship.alumList.length}
								</p>
							</div>
							<div className=''>
								<button onClick={() => navigateToDetail(scholarship.scholarshipId)}>View Details</button>
							</div>       
						</div>
					</div>
					))}
				</div>
			)}
		</div>
	)
}