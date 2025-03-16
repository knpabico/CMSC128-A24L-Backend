"use client";
import { useJobOffer } from "@/context/JobOfferContext";
import { JobOffering } from "@/models/models";

export default function Users() {
  const { jobOffers, isLoading, setShowForm, showForm, handleSubmit, company, setCompany, 
    employmentType, setEmploymentType, experienceLevel, 
    setExperienceLevel, jobDescription, setJobDescription, jobType, 
    setJobType, position, setPosition, handleSkillChange, salaryRange, 
    setSalaryRange } = useJobOffer();

  return (
    <div>
      <h1>Job Offers</h1>
      {isLoading && <h1>Loading</h1>}
      {jobOffers
        .filter((job: JobOffering) => job.status === "Accepted") 
        .map((job: JobOffering, index: number) => (
          <div key={index} className="p-1">
            <h2>{job.company}</h2>
            <h1>{job.employmentType}</h1>
            <h2>{job.experienceLevel}</h2>
            <h2>{job.position}</h2>
            <h2>{new Date(job.datePosted).toLocaleString()}</h2>
          </div>
      ))}

    <button
      className="fixed bottom-8 right-8 bg-blue-500 text-white p-5 rounded-full"
      onClick={() => setShowForm(!showForm)}
    >
      +
    </button>
      {showForm && (
          <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center w-full h-full">
            <form  onSubmit={handleSubmit} className="bg-white p-8 rounded-lg border-2 border-gray shadow-lg w">
            <h2 className="text-xl mb-4">Post a Job</h2>

                <input type="text" placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full mb-4 p-2 border rounded" required />

                <input type="text" placeholder="Employment Type" value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} className="w-full mb-4 p-2 border rounded" required />

                <input type="text" placeholder="Experience Level" value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} className="w-full mb-4 p-2 border rounded" required />

                <textarea placeholder="Job Description" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} className="w-full mb-4 p-2 border rounded" required />

                <input type="text" placeholder="Job Type" value={jobType} onChange={(e) => setJobType(e.target.value)} className="w-full mb-4 p-2 border rounded" required />

                <input type="text" placeholder="Position" value={position} onChange={(e) => setPosition(e.target.value)} className="w-full mb-4 p-2 border rounded" required />

                <input type="text" placeholder="Required Skills (comma-separated)" onChange={handleSkillChange} className="w-full mb-4 p-2 border rounded" required />

                <input type="text" placeholder="Salary Range" value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)} className="w-full mb-4 p-2 border rounded" required />

                <div className="flex justify-between">
                  <button type="button" onClick={() => setShowForm(false)} className="text-gray-500">Cancel</button>
                  <button type="submit" className="bg-blue-500 text-white p-2 rounded">Submit</button>
                </div>
            </form>
          </div>
        )}
    </div>
  );
}