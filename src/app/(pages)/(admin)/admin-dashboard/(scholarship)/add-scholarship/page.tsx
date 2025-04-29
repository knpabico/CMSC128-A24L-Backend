"use client";

import { Announcement, Scholarship } from "@/models/models"
import { useScholarship } from "@/context/ScholarshipContext"
import { title } from "process";
import React, { useState } from "react";
import { toastError, toastSuccess } from "@/components/ui/sonner";
import { FormMessage } from "@/components/ui/form";

export default function AddScholarships(){
	const {
		scholarships,
        loading,
        error,
        addScholarship,
	} = useScholarship();

	const [formData, setFormData] = useState({
		description: "",
		title: "",
		image: "",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const newScholarship: Scholarship ={
			title: formData.title,
			description: formData.description,
			datePosted: new Date(),
			alumList: [],
			image: "",
			scholarshipId: ""
		};
		const response = await addScholarship(newScholarship);
		if (response.success){
			toastSuccess(`You have successfully created ${formData.title}.`)
			setFormData({description:"", title:"", image:""});
		} else{
			console.error("Error adding scholarship: ", response.message);
		}
	}

	return (
		<>
			<div className="text-3xl my-5">
				Add Scholarship
			</div>
			{loading && <h1>Loading</h1>}
			{/* Form */}
			<div className="bg-white p-5 rounded-lg">
				<form className="flex flex-col gap-5" onSubmit={handleSubmit}>
					<div>
						<label>Scholarship Name:</label>
						<input type="text" placeholder="Scholarship Name" value={formData.title} onChange={(e) => setFormData({...formData, title:e.target.value})} required></input>
					</div>
					<div>
						<label>Scholarship Description:</label>
						<textarea placeholder="Scholarship Description" value={formData.description} onChange={(e) => setFormData({...formData, description:e.target.value})} required></textarea>
					</div>
					<div>
						<label>Upload Image:</label>
						<input type="file" value={formData.image} onChange={(e) => setFormData({...formData, image:e.target.value})} required></input>
					</div>
					<div>
						<button className="bg-blue-600 p-2 rounded-xl">Submit</button>
					</div>
				</form>
			</div>
		</>
	)
}