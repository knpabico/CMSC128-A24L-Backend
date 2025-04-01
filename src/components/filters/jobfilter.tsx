import { useState } from "react";

interface JobFiltersProps {
  onFilterChange: (filters: any) => void;
}

export default function JobFilters({ onFilterChange }: JobFiltersProps) {
  const [jobType, setJobType] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");

  const handleFilterChange = () => {
    onFilterChange({ jobType, employmentType, experienceLevel });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>

      {/* Job Type Filter */}
      <input
        type="text"
        placeholder="Job Type"
        value={jobType}
        onChange={(e) => setJobType(e.target.value)}
        className="w-full mb-2 p-2 border rounded"
      />

      {/* Employment Type Filter */}
      <input
        type="text"
        placeholder="Employment Type"
        value={employmentType}
        onChange={(e) => setEmploymentType(e.target.value)}
        className="w-full mb-2 p-2 border rounded"
      />

      {/* Experience Level Filter */}
      <input
        type="text"
        placeholder="Experience Level"
        value={experienceLevel}
        onChange={(e) => setExperienceLevel(e.target.value)}
        className="w-full mb-2 p-2 border rounded"
      />

      <button
        className="w-full bg-blue-500 text-white py-2 rounded mt-2"
        onClick={handleFilterChange}
      >
        Apply Filters
      </button>
    </div>
  );
}