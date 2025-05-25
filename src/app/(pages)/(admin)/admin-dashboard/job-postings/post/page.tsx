"use client";

import { useState } from "react";
import { useJobOffer } from "@/context/JobOfferContext";
import { Button } from "@/components/ui/button";
import { ChevronRight, Check, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ModalInput from "@/components/ModalInputForm";
import { toastError, toastSuccess } from "@/components/ui/sonner";
import { useRouter } from "next/navigation";

// In Next.js page components, you can't accept props directly
export default function PostJobPage() {
  const router = useRouter();

  const {
    handleSubmit,
    company,
    setCompany,
    employmentType,
    setEmploymentType,
    experienceLevel,
    setExperienceLevel,
    jobDescription,
    setJobDescription,
    jobType,
    setJobType,
    position,
    setPosition,
    requiredSkill,
    handleSkillChange,
    salaryRange,
    setSalaryRange,
    location,
    setLocation,
    image,
    preview,
    fileName,
    handleImageChange,
    handleSaveDraft,
    setJobImage,
    setPreview,
    setFileName
  } = useJobOffer();

  const resetForm = () => {
    setPosition("");
    setCompany("");
    setLocation("");
    setJobDescription("");      
    setSalaryRange("");
    setExperienceLevel("");
    setEmploymentType("");
    setJobType("");
    handleSkillChange({ target: { value: "" } });
    setJobImage(null);
    setPreview(null);
    setFileName("");
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employmentTypeOpen, setEmploymentTypeOpen] = useState(false);
  const [jobTypeOpen, setJobTypeOpen] = useState(false);
  const [experienceLevelOpen, setExperienceLevelOpen] = useState(false);

  const filterCategories = {
    "Experience Level": ["Entry Level", "Mid Level", "Senior Level"],
    "Job Type": [
      "Cybersecurity",
      "Software Development",
      "Data Science",
      "UX/UI Design",
      "Project Management",
      "Others",
    ],
    "Employment Type": ["Full Time", "Part Time", "Contract", "Internship"],
    Skills: ["JavaScript", "Python", "Java", "C++", "React", "Node.js", "SQL", "Figma", "Canva"],
  };

  // Function to handle navigation back to list
  const goBackToList = () => {
    router.push('/admin-dashboard/job-postings');
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <div>Home</div>
        <div>
          <ChevronRight size={15} />
        </div>
        <div className="cursor-pointer hover:text-[#0856BA]" 
        onClick={goBackToList}
        >
          Manage Job Posting
        </div>
        <div>
          <ChevronRight size={15} />
        </div>
        <div className="font-bold text-[var(--primary-blue)]">Post a Job</div>
      </div>
      <div className="w-full">
        <div className="flex items-center justify-between">
          <div className="font-bold text-3xl">Post a Job Opportunity</div>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="bg-white flex flex-col justify-between rounded-2xl overflow-hidden w-full p-4">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              // Check all required fields
              if (
                !position ||
                !employmentType ||
                !jobType ||
                !jobDescription ||
                !company ||
                !location ||
                !experienceLevel ||
                !salaryRange ||
                !requiredSkill.length ||
                !image
              ) {
                toastError("Please fill in all required fields");
                return;
              }
              try {
                await handleSubmit(e);
                toastSuccess("Job submitted successfully.");
                resetForm();
                router.push('/admin-dashboard/job-postings');
              } catch (error) {
                console.error("Error submitting job:", error);
                toastError("There was an error submitting the job. Please try again.");
              }
            }}
          >
            <div className="grid grid-cols-2 gap-6 mt-1">
              {/* Left Column ng form */}
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Job Position<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Software Engineer"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full p-1.5 border rounded text-sm"
                    maxLength={200}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Employment Type<span className="text-red-500">*</span>
                  </label>
                  <DropdownMenu open={employmentTypeOpen} onOpenChange={setEmploymentTypeOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between border rounded p-2 bg-white text-left font-normal"
                      >
                        {employmentType || "Select Employment Type"}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[300px] bg-white p-1 border rounded shadow-md">
                      {filterCategories["Employment Type"].map((type) => (
                        <Button
                          key={type}
                          variant="ghost"
                          className="w-full justify-start p-2 text-left hover:bg-gray-100"
                          onClick={() => {
                            setEmploymentType(type);
                            setEmploymentTypeOpen(false);
                          }}
                        >
                          {type}
                          {employmentType === type && <Check className="ml-auto h-4 w-4" />}
                        </Button>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Job Type<span className="text-red-500">*</span>
                  </label>
                  <DropdownMenu open={jobTypeOpen} onOpenChange={setJobTypeOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between border rounded p-2 bg-white text-left font-normal"
                      >
                        {jobType || "Select Job Type"}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[300px] bg-white p-2 border rounded shadow-md">
                      {filterCategories["Job Type"].map((type) => (
                        <Button
                          key={type}
                          variant="ghost"
                          className="w-full justify-start p-2 text-left hover:bg-gray-100"
                          onClick={() => {
                            setJobType(type);
                            setJobTypeOpen(false);
                          }}
                        >
                          {type}
                          {jobType === type && <Check className="ml-auto h-4 w-4" />}
                        </Button>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Job Description<span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="E.g., Outline the role, responsibilities, and key qualifications for this position."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="w-full p-1.5 border rounded resize-none text-sm"
                    maxLength={2000}
                    style={{ height: "110px" }}
                    required
                  />
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    variant="ghost"
                    className="pl-2 text-[#0856BA] hover:text-blue-700 text-sm bg-transparent hover:bg-transparent"
                  >
                    Need AI help for description?
                  </Button>
                  <ModalInput
                    isOpen={isModalOpen}
                    mainTitle={position}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={(response) => setJobDescription(response)}
                    title="AI Assistance for Job Description"
                    type="job offer"
                    subtitle="Get AI-generated description for your job offer. Only fill in the applicable fields."
                  />
                </div>
              </div>
              {/* Right Column ng form */}
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Company Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full p-1.5 border rounded text-sm"
                    maxLength={200}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Location<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-1.5 border rounded text-sm"
                    maxLength={200}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Experience Level<span className="text-red-500">*</span>
                  </label>
                  <DropdownMenu open={experienceLevelOpen} onOpenChange={setExperienceLevelOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between border rounded p-2 bg-white text-left font-normal"
                      >
                        {experienceLevel || "Select Experience Level"}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[300px] bg-white p-2 border rounded shadow-md">
                      {filterCategories["Experience Level"].map((level) => (
                        <Button
                          key={level}
                          variant="ghost"
                          className="w-full justify-start p-1.5 text-left hover:bg-gray-100"
                          onClick={() => {
                            setExperienceLevel(level);
                            setExperienceLevelOpen(false);
                          }}
                        >
                          {level}
                          {experienceLevel === level && <Check className="ml-auto h-4 w-4" />}
                        </Button>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Salary Range<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">₱</span>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. 10000-30000"
                      value={salaryRange}
                      onChange={(e) => setSalaryRange(e.target.value)}
                      onInput={(e) => {
                        const value = (e.target as HTMLInputElement).value;
                        if (!/^\d+(-\d+)?$/.test(value)) {
                          (e.target as HTMLInputElement).value = value
                            .replace(/[^0-9-]/g, "")            // Remove non-digit and non-dash characters
                            .replace(/^-/g, "")                 // Remove a dash if it's the first character
                            .replace(/(-.*)-+/g, "$1");         // Remove any extra dashes after the first one
                        }
                      }}
                      pattern="^\d+(-\d+)?$" // Regex to allow numbers or a range like "10000-30000"
                      className="w-full pl-8 p-1.5 border rounded text-sm"
                      required
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Required Skills<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={requiredSkill.join(", ")}
                    placeholder="Required Skills (comma-separated)"
                    onChange={handleSkillChange}
                    className="w-full p-1.5 border rounded placeholder:text-sm"
                    required
                  />
                </div>
              </div>
            </div>
            <hr className="my-2 border-t border-gray-300" />
            <div className="mb-4 pt-2 pl-1">
              <label className="block text-sm font-medium mb-1">
                Company Logo<span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer">
                  <div className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                    Choose File
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                <span className="text-sm text-gray-500">{fileName || "No file chosen"}</span>
              </div>
              {preview && (
                <div className="mt-3">
                  <img src={preview || "/placeholder.svg"} alt="Preview" className="h-20 object-contain" />
                </div>
              )}
            </div>
            <div className="flex justify-between items-center mt-6">
              {/* Left side - Cancel button */}
              <div>
                <button
                  type="button"
                  className="h-10 px-5 flex items-center justify-center rounded-full bg-[#FFFFFF] border border-gray-400 text-sm font-semibold text-gray-700 shadow-inner shadow-white/10 transition-all duration-300 hover:bg-red-700 hover:text-white hover:shadow-lg"
                  onClick={() => {
                    resetForm();
                    router.push('/admin-dashboard/job-postings');
                  }}
                >
                  Cancel
                </button>
              </div>

              {/* Right side - Save as Draft and Submit buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  className="h-10 px-5 flex items-center justify-center rounded-full bg-[#FFFFFF] border border-[#0856BA] text-sm font-semibold text-[#0856BA] shadow-inner shadow-white/10 transition-all duration-300 hover:bg-[#0856BA] hover:text-white hover:shadow-lg"
                  onClick={async (e) => {
                    try {
                      await handleSaveDraft(e);
                      toastSuccess("Draft saved successfully");
                      resetForm();
                      goBackToList();
                    } catch (error) {
                      toastError("Failed to save draft. Please try again.");
                      console.error("Error saving draft:", error);
                    }
                  }}
                >
                  Save as Draft
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 flex items-center justify-center rounded-full bg-[#0856BA] border border-[#0856BA] text-sm font-semibold text-white shadow-inner shadow-white/10 transition-all duration-300 hover:bg-[#063d8c] hover:shadow-lg"
                >
                  Submit
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}