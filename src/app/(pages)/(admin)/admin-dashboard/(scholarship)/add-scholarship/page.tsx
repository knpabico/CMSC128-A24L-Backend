"use client";

import { uploadImage } from "@/lib/upload";
import { Scholarship } from "@/models/models"
import { useScholarship } from "@/context/ScholarshipContext"
import React, { useState } from "react";
import { toastError, toastSuccess } from "@/components/ui/sonner";

export default function AddScholarships(){
	const { scholarships, loading, error, addScholarship, updateScholarship } = useScholarship();
	// Input Data
	const [formData, setFormData] = useState({
		description: "",
		title: "",
		image: "",
	});
	const [preview, setPreview] = useState(null);
	const [message, setMessage] = useState("");
	const [isError, setIsError] = useState(false);
	const [image, setImage] = useState(null);

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
		handleUpload(newScholarship);
		if (response.success){
			toastSuccess(`You have successfully created ${formData.title}.`)
			setFormData({description:"", title:"", image:""});
			setImage(null);
			setPreview(null);
		} else{
			console.error("Error adding scholarship: ", response.message);
		}
	}

	const handleImageChange = (e:any) => {
		const file = e.target.files[0];
		if (file) {
			setImage(file);
			setPreview(URL.createObjectURL(file)); //preview
		}
	};

	const handleUpload = async (newScholarship: Scholarship) => {
		if (!image) {
			setMessage("No image selected");
			setIsError(true);
			return;
		}
		try {
			const data = await uploadImage(image, `scholarship/${newScholarship.scholarshipId}`); 
			const result = await updateScholarship(newScholarship.scholarshipId, {image: data.url} );
			if (data.success) {
			setIsError(false);
			setMessage("Image uploaded successfully!");
			console.log("Image URL:", data.url); // URL of the uploaded image
			} else {
			setMessage(data.result);
			setIsError(true);
			}
		} catch (error) {
			console.error("Error uploading image:", error);
		}
	};

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
						<input type="file" accept="image/*" onChange={handleImageChange} required/>
						{preview && (
							<div className="mt-4">
								<p>Preview:</p>
								<img src={preview} alt="Uploaded Preview" style={{ width: "200px", borderRadius: "8px" }} />
							</div>
						)}
					</div>
					<div>
						<button className="bg-blue-600 p-2 rounded-xl">Submit</button>
					</div>
				</form>
			</div>
		</>
	)
}