"use client";

import { Scholarship } from "@/models/models"
import { useScholarship } from "@/context/ScholarshipContext"
import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { toastSuccess } from "@/components/ui/sonner";
import { ChevronRight, CircleAlert, CircleX, Trash2 } from "lucide-react";
import { Dialog, DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import { DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog';

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

	//  Scholarship Deletion
	const handleDelete = (scholarship : Scholarship) => {
		if (!scholarship.scholarshipId) {
			console.error("No scholarship ID provided.");
			return;
		}
		deleteScholarship(scholarship.scholarshipId);
		toastSuccess(`${scholarship.title} has been deleted successfully.`)
	}

	const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
	const [selectedScholarship, setSelectedScholarship] = useState<Scholarship>();
	
	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-center gap-2">
				<div> Home </div>
				<div> <ChevronRight size={15} /> </div>
				<div> Manage Scholarships </div>
			</div>
			<div className="w-full">
        <div className="flex items-center justify-between">
          <div className="font-bold text-3xl">
            Manage Scholarships
          </div>
          <div className="bg-[var(--primary-blue)] text-white px-4 py-2 rounded-full cursor-pointer hover:bg-blue-600">
            + Create Scholarship
          </div>
        </div>
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
						className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
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
							<div className='flex gap-5'>
								<button className="text-blue-700 hover:cursor-pointer" onClick={() => navigateToDetail(scholarship.scholarshipId)}>View Details</button>
								<button className="text-red-700 hover:cursor-pointer" onClick={() => {
									setSelectedScholarship(scholarship);
									setIsConfirmationOpen(true);
								}} >
									<Trash2 className='size-6'/>
								</button>
							</div>       
						</div>
					</div>
					))}
				</div>
			)}
			{/* Confirmation Dialog */}
			{isConfirmationOpen && (
			<Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
				<DialogContent className='w-96'>
					<DialogHeader className='text-red-500 flex items-center gap-5'>
						<CircleX className='size-15'/>
						<DialogTitle className="text-md text-center">
							Are you sure you want to delete <br /> <strong>{selectedScholarship?.title}</strong>?
						</DialogTitle>
					</DialogHeader>
					<DialogFooter className='mt-5'>
						<button className="text-sm text-white w-full px-1 py-[5px] rounded-full font-semibold text-center flex justify-center border-red-700 bg-red-700  hover:bg-red-500 hover:cursor-pointer" 
							onClick={() => {
								if(selectedScholarship){
									handleDelete(selectedScholarship);
									setIsConfirmationOpen(false);
								}
							}} >Delete</button>
						<button className="text-sm text-[#0856BA] w-full px-1 py-[5px] rounded-full font-semibold text-center flex justify-center border-[#0856BA] border-2 hover:bg-gray-100" onClick={() => setIsConfirmationOpen(false)}>Cancel</button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		  )}
		</div>
	)
}