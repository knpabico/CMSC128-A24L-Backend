// pages/scholarships/[id].tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useScholarship } from '@/context/ScholarshipContext';
import { useAuth } from '@/context/AuthContext';
import { Scholarship } from '@/models/models';
import { CircleCheck, HandCoins, MoveLeft } from 'lucide-react';

const ScholarshipDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { getScholarshipById, updateScholarship } = useScholarship();
  const { user } = useAuth();
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sponsoring, setSponsoring] = useState(false);

  const scholarshipId = params?.id as string;

  useEffect(() => {
    const fetchScholarship = async () => {
      try {
        setLoading(true);
        const data = await getScholarshipById(scholarshipId);
        if (data) {
          setScholarship(data);
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

  const handleSponsor = async () => {
    if (!user || !scholarship) return;

    try {
      setSponsoring(true);
      const currentAlumList = scholarship.alumList || [];

      if (!currentAlumList.includes(user.uid)) {
        const updatedAlumList = [...currentAlumList, user.uid];

        const result = await updateScholarship(scholarshipId, {
          alumList: updatedAlumList
        });

        if (result.success) {
          setScholarship({
            ...scholarship,
            alumList: updatedAlumList
          });
        }
      }
    } catch (err) {
      console.error("Error sponsoring scholarship:", err);
    } finally {
      setSponsoring(false);
    }
  };

  const goBack = () => {
    router.back();
  };

  if (loading) {
    return <div style={{ margin: '20px' }}>Loading...</div>;
  }

  const isAlreadySponsoring = scholarship?.alumList?.includes(user?.uid);

  return (
		<>
			<div className='bg-[#EAEAEA] mx-auto px-10 py-8'>
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
					<div className="flex justify-between items-center">
						<h1 className="text-5xl font-bold text-gray-800">{scholarship?.title}</h1>
						{user && (
							<>
									{sponsoring ? (
											<button onClick={handleSponsor} disabled className="your-processing-class">
													Processing...
											</button>
									) : isAlreadySponsoring ? (
											<button onClick={handleSponsor} disabled className="flex items-center justify-end text-white bg-green-600 font-medium gap-3 w-fit px-4 py-3 rounded-full shadow-black-500 shadow-md">
												<CircleCheck className='size-6' />
												Currently Sponsoring
											</button>
									) : (
											<button onClick={handleSponsor} className="flex items-center justify-end text-white bg-blue-600 font-medium gap-3 w-fit px-4 py-3 rounded-full hover:bg-blue-500 hover:cursor-pointer shadow-black-500 shadow-md">
												<HandCoins className='size-6'/>
												Sponsor a Student
											</button>
									)}
							</>
					)}
					</div>
					{/* Image */}
					<div className="bg-cover bg-center h-[230px] md:h-[350px] lg:h-[400px]" style={{ backgroundImage: 'url("/ICS3.jpg")' }} />
					{/* Event description */}
					<p className="mt-5">{scholarship?.description}</p>
					{/* Event Detaisl */}
					<div className='grid grid-cols-2 w-full items-center'>
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
					{/* Stories */}
					<div className='my-12 w-full text-center'>
							<h1 className='font-semibold text-3xl'>Featured Stories</h1>
						</div>    
				</div>
			</div>
		</>
  );
};

export default ScholarshipDetailPage;
