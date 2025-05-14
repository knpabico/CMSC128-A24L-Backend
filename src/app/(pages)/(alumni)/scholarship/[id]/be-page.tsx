// pages/scholarships/[id].tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useScholarship } from '@/context/ScholarshipContext';
import { useAuth } from '@/context/AuthContext';
import { Scholarship } from '@/models/models';

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

  const isAlreadySponsoring = scholarship?.alumList?.includes(user!.uid);

  return (
	<div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto' }}>
	  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
		<button onClick={goBack}>Back to scholarships</button>

		{user && (
		  <button 
			onClick={handleSponsor} 
			disabled={sponsoring || isAlreadySponsoring}
			style={{ marginLeft: 'auto' }}
		  >
			{sponsoring ? "Processing..." : isAlreadySponsoring ? "Already Sponsoring" : "Sponsor a Student"}
		  </button>
		)}
	  </div>

	  <h1 style={{ marginBottom: '10px' }}>{scholarship!.title}</h1>
	  <p style={{ marginBottom: '30px' }}>Posted on: {scholarship!.datePosted.toLocaleString()}</p>

	  <div style={{ marginBottom: '30px' }}>
		<h2>Description:</h2>
		<p>{scholarship!.description}</p>
	  </div>

	  <div style={{ marginBottom: '30px' }}>
		<h2>Featured Stories</h2>
		{/* pag na-implement na yung sa newsletter */}
	  </div>

	</div>
  );
};

export default ScholarshipDetailPage;
