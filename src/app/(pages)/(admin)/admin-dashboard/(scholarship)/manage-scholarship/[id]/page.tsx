"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useScholarship } from '@/context/ScholarshipContext';
import { Scholarship } from '@/models/models';
import { MoveLeft, Pen, Trash2 } from 'lucide-react';
import { toastError, toastSuccess } from '@/components/ui/sonner';
import { uploadImage } from "@/lib/upload";

const ScholarshipDetailPage: React.FC = () => {
	
  const params = useParams();
  const router = useRouter();
  const { getScholarshipById, updateScholarship } = useScholarship();
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scholarshipId = params?.id as string;

  const [preview, setPreview] = useState(null);
	const [message, setMessage] = useState("");
	const [isError, setIsError] = useState(false);
	const [image, setImage] = useState(null);

  useEffect(() => {
    const fetchScholarship = async () => {
      try {
        setLoading(true);
        const data = await getScholarshipById(scholarshipId);
        if (data) {
          setScholarship(data);
					setEditData({
            title: data.title || "",
            description: data.description || "",
						image: data.image || ""
        	});
					setPreview(data.image);
        } else {
          setError("Scholarship not found");
        }
      } catch (err) {
        setError("Error loading scholarship details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (scholarshipId) {
      fetchScholarship();
    }
  }, [scholarshipId, getScholarshipById]);

  const goBack = () => {
    router.back();
  };

	// Scholarship Edit/Update
	const [editData, setEditData] = useState({
			title: "",
			description: "",
			image: ""
	});

	const handleEdit = async (e: React.FormEvent) => {
		e.preventDefault()
    if (!scholarship?.scholarshipId) return;
    let updatedData = { ...editData };
    if (image && image !== scholarship.image) {
			try {
				const data = await uploadImage(image, `scholarship/${scholarship.scholarshipId}`);
				if (data.success) {
						updatedData.image = data.url;
						setIsError(false);
						setMessage("Image uploaded successfully!");
						console.log("Image URL:", data.url);
				} else {
						setMessage(data.result || "Image upload failed.");
						setIsError(true);
						return; 
				}
			} catch (error) {
					console.error("Error uploading image:", error);
					toastError("Image upload error.");
					return; 
			}
    }
    const result = await updateScholarship(scholarship.scholarshipId, updatedData);
    if (result.success) {
        toastSuccess("Scholarship updated successfully!");
    } else {
        toastError("Failed to update: " + result.message);
    }
};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setImage(file);
			setPreview(URL.createObjectURL(file)); //preview
		}
	};

  if (loading) {
    return <div style={{ margin: '20px' }}>Loading...</div>;
  }

  return (
    <>
		{/* Back button */}
		<div className="text-sm mb-4 inline-flex gap-2 items-center hover:underline hover:cursor-pointer">
			<button onClick={goBack} className='flex items-center gap-2'>
				<MoveLeft className='size-[17px]'/>
				Back to scholarships
			</button>
		</div>
		{/* Header */}
		<div className="text-3xl my-5">
			Scholarship Details
		</div>
		{loading && <h1>Loading</h1>}
		{/* Form */}
		<div className="bg-white p-5 rounded-lg">
			<form className="flex flex-col gap-5" onSubmit={handleEdit}>
				<div>
					<label>Scholarship Name:</label>
					<input type="text" placeholder="Scholarship Name" value={editData.title} onChange={(e) => setEditData({...editData, title:e.target.value})} required></input>
				</div>
				<div>
					<label>Scholarship Description:</label>
					<textarea placeholder="Scholarship Description" value={editData.description} onChange={(e) => setEditData({...editData, description:e.target.value})} required></textarea>
				</div>
				<div>
					<label>Upload Image:</label>
					<input type="file" accept="image/*" onChange={handleImageChange}/>
					{preview && (
						<div className="mt-4">
							<p>Image Preview:</p>
							<img src={preview} alt="Uploaded Preview" style={{ width: "200px", borderRadius: "8px" }} />
						</div>
					)}
				</div>
				{/* Date */}
				<div className='flex items-center'>
					<p className="text-sm text-gray-600">
						Posted on {scholarship?.datePosted.toLocaleDateString()}
					</p>
				</div>
				{/* Sponsors */}
				<div className="flex items-center text-sm text-gray-600">
					<span className="mr-2">Sponsors:</span>
					<span className="font-medium">{scholarship?.alumList.length}</span>
				</div>
				<div>
					<button className="bg-blue-600 p-2 rounded-xl">Save</button>
				</div>
			</form>
		</div>
    </>
  );
};

export default ScholarshipDetailPage;