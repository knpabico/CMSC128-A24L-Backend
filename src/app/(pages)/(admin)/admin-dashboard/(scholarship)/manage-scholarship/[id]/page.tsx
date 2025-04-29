"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useScholarship } from '@/context/ScholarshipContext';
import { Scholarship } from '@/models/models';
import { MoveLeft, Pen, Trash2 } from 'lucide-react';
import { toastError, toastSuccess } from '@/components/ui/sonner';


const ScholarshipDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { getScholarshipById, updateScholarship, deleteScholarship } = useScholarship();
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scholarshipId = params?.id as string;

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
	
	//  Scholarship Deletion
  const handleDelete = (scholarshipId : string | null) => {
	if (!scholarshipId) {
        console.error("No scholarship ID provided.");
        return;
    }
    deleteScholarship(scholarshipId);
		toastSuccess(`${scholarship?.title} has been deleted successfully.`)
    goBack();
  }
	// Scholarship Edit/Update
  const [isEditing, setIsEditing] = useState(false);
	const [editData, setEditData] = useState({
			title: "",
			description: "",
			image: ""
	});
	const handleEdit = async () => {
		if (scholarship?.scholarshipId) {
			const result = await updateScholarship(scholarship.scholarshipId, editData);
			if (result.success) {
					toastSuccess("Scholarship updated successfully!");
					setIsEditing(false);
			} else {
					toastError("Failed to update: " + result.message);
			}
		}
};


  if (loading) {
    return <div style={{ margin: '20px' }}>Loading...</div>;
  }

  return (
    <>
      <div className='bg-[#EAEAEA] px-10 py-8'>
        {/* Back button */}
        <div className="text-sm mb-4 inline-flex gap-2 items-center hover:underline hover:cursor-pointer">
          <button onClick={goBack} className='flex items-center gap-2'>
            <MoveLeft className='size-[17px]'/>
            Back to scholarships
          </button>
        </div>
        {/* Body */}
        <div className="flex flex-col gap-[20px] md:px-[50px] xl:px-[200px]">
          {/* Title */}
					{isEditing ? (
						<div className="flex justify-between items-center">
							<input type="text" value={editData.title} onChange={(e) => setEditData({...editData, title:e.target.value})} className="text-5xl font-bold text-gray-800" required></input>
							<div className='flex gap-3'>
								<button className='text-blue-600' onClick={() => handleEdit()} >
									Save
								</button>
								<button className="text-red-700" onClick={() => setIsEditing(false)}>
									Cancel
								</button>
							</div>
						</div>
					) : (
						<div className="flex justify-between items-center">
							<h1 className="text-5xl font-bold text-gray-800">{scholarship?.title}</h1>
							<div className='flex gap-3'>
								<button className='text-blue-600' onClick={() => setIsEditing(true)}>
									<Pen className='size-10'/>
								</button>
								<button className="text-red-700" onClick={() => handleDelete(scholarship?.scholarshipId ?? null)}>
									<Trash2  className='size-10'/>
								</button>
							</div>
						</div>
					)}
          {/* Image */}
          <div className="bg-cover bg-center h-[230px] md:h-[350px] lg:h-[400px]" style={{ backgroundImage: 'url("/ICS3.jpg")' }} />
          {/* Event description */}
					{isEditing ? (
						<div>
							<textarea value={editData.description} onChange={(e) => setEditData({...editData, description:e.target.value})} className='w-full h-fit' required></textarea>
						</div>
					) : (
						<div>
							<p className="mt-5">{scholarship?.description}</p>
						</div>
					)}
          
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

        </div>
      </div>
    </>
  );
};

export default ScholarshipDetailPage;