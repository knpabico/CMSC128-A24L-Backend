// pages/scholarships/[id].tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useScholarship } from "@/context/ScholarshipContext";
import { useAuth } from "@/context/AuthContext";
import {
  Scholarship,
  ScholarshipStudent,
	Student,
} from "@/models/models";
import {
	CheckCircle,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleX,
  Clock,
  HandCoins,
	HelpCircle,
} from "lucide-react";


//for featured stories
import { useFeatured } from "@/context/FeaturedStoryContext";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { toastSuccess } from "@/components/ui/sonner";

const ScholarshipDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { getScholarshipById, updateScholarship, getStudentsByScholarshipId, addScholarshipStudent, getScholarshipStudentsByScholarshipId } = useScholarship();
  const { user } = useAuth();
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sponsoring, setSponsoring] = useState(false);
  const scholarshipId = params?.id as string;
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
	const [isStudentConfirmationOpen, setIsStudentConfirmationOpen] = useState(false);
  const [isThankYouOpen, setIsThankYouOpen] = useState(false);
	const [isStudentThankYouOpen, setStudentIsThankYouOpen] = useState(false);
  const { featuredItems, isLoading } = useFeatured();

	const [students, setStudents] = useState<Student[]>([]);
	const [loadingStudents, setLoadingStudents] = useState(true);
	const [studentDetails, setstudentDetails] = useState< Student | null>(null);
  const [sortOption, setSortOption] = useState<"oldest" | "youngest" | "A-Z" | "Z-A">("A-Z");
  const [filterOption, setFilterOption] = useState<"all" | "available" |"pending" | "approved">("all");
  const [scholarshipStudents, setScholarshipStudents] = useState<ScholarshipStudent[]>([]);
 
  const eventStories = featuredItems.filter(
    (story: { type: string; }) => story.type === "scholarship"
  );

  const sortedStories = [...eventStories].sort((a, b) => {
    const dateA =
      a.datePosted instanceof Date ? a.datePosted : new Date(a.datePosted);
    const dateB =
      b.datePosted instanceof Date ? b.datePosted : new Date(b.datePosted);
    return dateB.getTime() - dateA.getTime();
  });
  // Featured Stories
  const [currentIndex, setCurrentIndex] = useState(0);
  const maxIndex = Math.max(0, sortedStories.length - 3);
  const nextSlide = () => {
    if (currentIndex < maxIndex) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  const visibleStories = sortedStories.slice(currentIndex, currentIndex + 3);

  const formatDate = (date: any) => {
    if (!date) return "Unknown date";

    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) {
      if (date?.toDate && typeof date.toDate === "function") {
        return date.toDate().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
      return "Invalid date";
    }

    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
    
    const fetchStudents = async () => {
			try {
			  setLoadingStudents(true);
			  const studentList = await getStudentsByScholarshipId(scholarshipId);
			  setStudents(studentList);

        const scholarshipStudentList = await getScholarshipStudentsByScholarshipId(scholarshipId);
        setScholarshipStudents(scholarshipStudentList);
			} catch (error) {
			  console.error("Error fetching students:", error);
			} finally {
			  setLoadingStudents(false);
			}
		  };

    if (scholarshipId) {
      fetchScholarship();
      fetchStudents();
    }

		
  }, [scholarshipId, getScholarshipById, getStudentsByScholarshipId, getScholarshipStudentsByScholarshipId]);

  const getStudentStatus = (studentId: string) => {
    const scholarshipStudent = scholarshipStudents.find((ss) => ss.studentId === studentId);
    return scholarshipStudent?.status || "available";
  };

  const handleSponsor = async () => {
    if (!user || !scholarship) return;

    try {
      setSponsoring(true);
      const currentAlumList = scholarship.alumList || [];

      if (!currentAlumList.includes(user.uid)) {
        const updatedAlumList = [...currentAlumList, user.uid];

        const result = await updateScholarship(scholarshipId, {
          alumList: updatedAlumList,
        });

        if (result.success) {
          setScholarship({
            ...scholarship,
            alumList: updatedAlumList,
          });
        }
      }
    } catch (err) {
      console.error("Error sponsoring scholarship:", err);
    } finally {
      setSponsoring(false);
    }
  };

  const handleStudentSponsor = async (studentId: string) => {
    if (!user || !scholarship) return;

    const newStudentSponsor: ScholarshipStudent = {
      ScholarshipStudentId: "",
      studentId: studentId,
      alumId: user.uid,
      scholarshipId: scholarship.scholarshipId,
      status: "pending", //accepted  or pending
      pdf: "",
    }

    const result = await addScholarshipStudent(newStudentSponsor);
		toastSuccess("Your sponsorship request has been submitted successfully!")
    console.log(result.message);
  }

  const goBack = () => {
    router.back();
  };

  if (loading) {
    return <div style={{ margin: "20px" }}>Loading...</div>;
  }

  const isAlreadySponsoring = scholarship?.alumList?.includes(user!.uid);

  const filteredAndSortedStudents = [...students]
    .filter((student) => {
      const status = getStudentStatus(student.studentId);
      if (filterOption === "all") return true; // Include all students if "all" is selected
      return status === filterOption; // Include only students matching the selected status
    })
    .sort((a, b) => {
      switch (sortOption) {
        case "oldest":
          return b.age - a.age; // Sort by age descending (oldest first)
        case "youngest":
          return a.age - b.age; // Sort by age ascending (youngest first)
        case "A-Z":
          return a.name.localeCompare(b.name); // Sort by name alphabetically (A-Z)
        case "Z-A":
          return b.name.localeCompare(a.name); // Sort by name reverse alphabetically (Z-A)
        default:
          return 0;
      }
    });


  return (
    <>
      <div className="bg-[#EAEAEA] mx-auto px-10 py-10">
        {/* Body */}
        <div className="flex flex-col gap-[20px] md:px-[50px] xl:px-[200px]">
          {/* Title */}
          <div className="flex justify-between items-center">
            <h1 className="text-5xl font-bold text-gray-800">
              {scholarship?.title}
            </h1>
            {user && (
              <>
                {sponsoring ? (
                  <button
                    onClick={handleSponsor}
                    disabled
                    className="your-processing-class"
                  >
                    Processing...
                  </button>
                ) : isAlreadySponsoring ? (
                  <button
                    onClick={handleSponsor}
                    disabled
                    className="flex items-center justify-end text-white bg-green-600 font-medium gap-3 w-fit px-4 py-3 rounded-full shadow-black-500 shadow-md"
                  >
                    <CircleCheck className="size-6" />
                    Interested in Sponsoring
                  </button>
                ) : (
                  <button
                    onClick={() => setIsConfirmationOpen(true)}
                    className={`flex items-center justify-end text-white 
                      ${scholarship?.status==="closed" 
                      ?"bg-gray-400 font-medium gap-3 w-fit px-4 py-3 rounded-full cursor-not-allowed shadow-black-500 shadow-md"
                      :"bg-blue-600 font-medium gap-3 w-fit px-4 py-3 rounded-full hover:bg-blue-500 hover:cursor-pointer shadow-black-500 shadow-md"}`}
                    disabled={scholarship?.status==="closed"}
                  >
                    <HandCoins className="size-6" />
                    Join as a Sponsor
                  </button>
                )}
              </>
            )}
          </div>
          {/* Image */}
          <div
            className="bg-cover bg-center h-[230px] md:h-[350px] lg:h-[400px]"
            style={{
              backgroundImage: `url("${scholarship?.image || "/ICS3.jpg"}")`,
            }}
          />
          {/* Event description */}
          <p className="mt-5">{scholarship?.description}</p>
          {/* Event Details */}
          <div className="grid grid-cols-2 w-full items-center">
            {/* Date */}
            <div className="flex items-center">
              <p className="text-sm text-gray-600">
                Posted on {scholarship?.datePosted.toLocaleDateString()}
              </p>
            </div>
            {/* Sponsors */}
            <div className="flex items-center text-sm text-gray-600">
              <span className="mr-2">Sponsors:</span>
              <span className="font-medium">
                {scholarship?.alumList.length}
              </span>
            </div>
          </div>

          {/* Confirmation Dialog */}
          {isConfirmationOpen && (
            <Dialog open={isConfirmationOpen}>
              <DialogContent className="w-96">
                <DialogHeader className="text-orange-500 flex items-center">
                  <CircleAlert className="size-15" />
                  <DialogTitle className="text-2xl">
                    {" "}
                    Confirm Your Interest{" "}
                  </DialogTitle>
                </DialogHeader>
                <p>
									Are you sure you want to express your interest in sponsoring the{" "}
									<strong>{scholarship?.title}</strong> scholarship?
								</p>
                <DialogFooter className="mt-5">
                  <button
                    className="text-sm text-white w-full px-1 py-[5px] rounded-full font-semibold text-center flex justify-center border-[#0856BA] bg-[#0856BA]  hover:bg-blue-500 hover:cursor-pointer"
                    onClick={() => {
                      setIsConfirmationOpen(false);
                      handleSponsor();
                      setIsThankYouOpen(true);
                    }}
                  >
                    Join as a sponsor
                  </button>
                  <button
                    className="text-sm text-[#0856BA] w-full px-1 py-[5px] rounded-full font-semibold text-center flex justify-center border-[#0856BA] border-2 hover:bg-gray-100"
                    onClick={() => setIsConfirmationOpen(false)}
                  >
                    Cancel
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* ThankYou Dialog */}
          {isThankYouOpen && (
            <Dialog open={isThankYouOpen}>
              <DialogContent className="w-96">
                <DialogHeader className="text-green-700 flex items-center">
                  <CircleCheck className="size-15" />
                  <DialogTitle className="text-center"> Thank you for your interest in our scholarship program. </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-center">
									Take your time in choosing a scholar whose journey you’d like to support — your generosity can help shape their future.
                </p>
                <DialogFooter className="mt-5">
                  <button
                    className="text-sm text-[#0856BA] w-full px-1 py-[5px] rounded-full font-semibold text-center flex justify-center border-[#0856BA] border-2 hover:bg-gray-100"
                    onClick={() => setIsThankYouOpen(false)}
                  >
                    Close
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

					{/* Student Section */}
					<div className="bg-[#FFFF] py-[20px] px-[20px] rounded-[10px] mt-3 shadow-md border border-gray-200">
						<div className="flex justify-between">
							<h2 className="text-md font-semibold">List of Students</h2>
							<div className="flex gap-3 items-center">
                Sort by:
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as "oldest" | "youngest" | "A-Z" | "Z-A")}
                  className="px-3 py- rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="A-Z">A-Z</option>
                  <option value="Z-A">Z-A</option>
                  <option value="oldest">Oldest</option>
                  <option value="youngest">Youngest</option>
                </select>
								| Filter by:
                  <select
                  value={filterOption}
                  onChange={(e) => setFilterOption(e.target.value as "pending" | "approved" | "all" | "available")}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All</option>
                  <option value="available">Available</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                </select>
							</div>
						</div>
						<div className="my-3">
								{loadingStudents ? (
									<p>Loading students...</p>
								) : filteredAndSortedStudents.length > 0 ? (
									<div className="overflow-x-auto">
										{/* Table Header */}
										<div className="flex w-full bg-gray-100 p-3 rounded-md mb-2">
											<div className="w-2/3 font-medium text-gray-700">
												Student
											</div>
											<div className="w-1/6 text-center font-medium text-gray-700">
												Status
											</div>
											<div className="w-1/6 text-center font-medium text-gray-700">
												Sponsorship
											</div>
										</div>
										
										{/* Table Body */}
										<div>
											<ul>
												{filteredAndSortedStudents.map((student) => (
													<li key={student.studentId}>
														<div className="flex w-full rounded-md px-3 my-2 items-center">
															<div className="w-2/3">
																<div className="text-md mb-1 font-semibold">
																	{student.name}
																</div>
																<div className="text-xs text-gray-600">
																	<div>
																		{student.age} years old
																	</div>
																	<div className="line-clamp-2 hover:line-clamp-none">
																		{student.shortBackground}
																	</div>
																</div>
															</div>
															
															{/* Status column */}
															<div className="w-1/6 flex justify-center">
																<button 
																	className={`flex text-sm rounded-full px-3 py-1 shadow-lg transition-colors justify-center items-center gap-2
																		${(() => {
																			const status = getStudentStatus(student.studentId)?.toLowerCase();
																			
																			switch(status) {
																				case 'approved':
																					return 'bg-green-500 text-white hover:bg-green-600';
																				case 'pending':
																					return 'bg-yellow-500 text-white hover:bg-yellow-600';
																				case 'rejected':
																					return 'bg-red-500 text-white hover:bg-red-600';
																				default:
																					return 'bg-gray-400 text-white hover:bg-gray-500';
																			}
																		})()}`}
																>
																	{(() => {
																		const status = getStudentStatus(student.studentId)?.toLowerCase();
																		
																		switch(status) {
																			case 'approved':
																				return <CircleCheck className="size-4" />;
																			case 'pending':
																				return <Clock className="size-4" />;
																			case 'rejected':
																				return <CircleX className="size-4" />;
																			default:
																				return <HelpCircle className="size-4" />;
																		}
																	})()}
																	
																	<span className="whitespace-nowrap">
																		{getStudentStatus(student.studentId) 
																			? getStudentStatus(student.studentId).charAt(0).toUpperCase() + getStudentStatus(student.studentId).slice(1)
																			: "None"}
																	</span>
																</button>
															</div>
															
															{/* Sponsorship column */}
															<div className="w-1/6 flex justify-center">
																<button 
																	onClick={() => {
																		setstudentDetails(student);
																		setIsStudentConfirmationOpen(true);
																	}}
																	className={`text-sm rounded-full px-3 py-1 text-white shadow-lg transition-colors
																		${
																				!isAlreadySponsoring || getStudentStatus(student.studentId) !== "available"
																						? "bg-gray-400 cursor-not-allowed"
																						: "bg-blue-600 hover:bg-blue-500 cursor-pointer"
																		}`}
																	disabled={getStudentStatus(student.studentId) !== "available" || !isAlreadySponsoring}
																	title={
																		getStudentStatus(student.studentId) === "available"
																			? "Sponsor this student"
																			: getStudentStatus(student.studentId) === "pending"
																			? "This student's sponsorship is pending approval"
																			: "This student is already sponsored"
																	}
																>
																	Sponsor
																</button>
															</div>
														</div>
														<div className="border-b-2 border-gray-100 w-full"></div>          
													</li>
												))}
											</ul>
										</div>
									</div>
								) : (
									<div className="text-center py-12 bg-gray-50 rounded-lg w-full">
										<h3 className="text-xl font-medium text-gray-600"> No students are available for sponsorship at the moment. </h3>
										<p className="text-gray-500 mt-2"> Please check back later or explore our other scholarship opportunities.</p>
									</div>
								)}
							</div>
					</div>

					{/* Confirmation Dialog */}
          {isStudentConfirmationOpen && (
            <Dialog open={isStudentConfirmationOpen}>
              <DialogContent className="w-96">
                <DialogHeader className="text-orange-500 flex items-center">
                  <CircleAlert className="size-15" />
                  <DialogTitle className="text-2xl">
                    {" "}
                    Confirm Sponsorship{" "}
                  </DialogTitle>
                </DialogHeader>
                <p>
                  {" "}
                  Are you sure you want to sponsor {" "}
                  <strong>{studentDetails?.name}</strong>?{" "}
                </p>
                <DialogFooter className="mt-5">
                  <button
                    className="text-sm text-white w-full px-1 py-[5px] rounded-full font-semibold text-center flex justify-center border-[#0856BA] bg-[#0856BA]  hover:bg-blue-500 hover:cursor-pointer"
                    onClick={() => {
                      setIsStudentConfirmationOpen(false);
                      if (studentDetails) {
												handleStudentSponsor(studentDetails.studentId);
											}
                      setIsThankYouOpen(true);
                    }}
                  >
                    Confirm
                  </button>
                  <button
                    className="text-sm text-[#0856BA] w-full px-1 py-[5px] rounded-full font-semibold text-center flex justify-center border-[#0856BA] border-2 hover:bg-gray-100"
                    onClick={() => setIsStudentConfirmationOpen(false)}
                  >
                    Cancel
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

					{isStudentThankYouOpen && (
            <Dialog open={isStudentThankYouOpen}>
              <DialogContent className="w-96">
                <DialogHeader className="text-green-700 flex items-center">
                  <CircleCheck className="size-15" />
                  <DialogTitle className="text-center"> Thank you for your support in sponsoring a student. </DialogTitle>
                </DialogHeader>
								<p className="text-sm text-center">
								Your kindness is opening doors to education and brighter futures for our ICS scholars.
								</p>
                <DialogFooter className="mt-5">
                  <button
                    className="text-sm text-[#0856BA] w-full px-1 py-[5px] rounded-full font-semibold text-center flex justify-center border-[#0856BA] border-2 hover:bg-gray-100"
                    onClick={() => setStudentIsThankYouOpen(false)}
                  >
                    Close
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          {/* Featured Stories Section - Carousel */}
          <div className="mt-16">
            <h2 className="text-2xl text-center font-bold mb-6 text-gray-800">
              Featured Stories
            </h2>

            {loading ? (
              <p className="text-gray-500 text-center">
                Loading featured stories...
              </p>
            ) : sortedStories.length === 0 ? (
              <p className="text-gray-500 text-center">
                No featured stories found.
              </p>
            ) : (
              <div className="relative">
                {/* Previous button */}
                <button
                  onClick={prevSlide}
                  disabled={currentIndex === 0}
                  className={`absolute left-0 top-1/2 transform -translate-y-1/2 -ml-4 z-10 bg-white rounded-full p-2 shadow-md
                        ${
                          currentIndex === 0
                            ? "opacity-30 cursor-not-allowed"
                            : "opacity-70 hover:opacity-100"
                        }`}
                  aria-label="Previous stories"
                >
                  <ChevronLeft size={24} />
                </button>

                {/* Stories grid - always 3 columns on larger screens */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-8">
                  {visibleStories.length === 0 && (
                    <div className="col-span-3 text-center text-gray-500">
                      No other stories available at this time.
                    </div>
                  )}
                  {visibleStories.map((story) => (
                    <div
                      key={story.featuredId}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                      onClick={() =>
                        router.push(`/scholarship/featured/${story.featuredId}`)
                      }
                    >
                      {story.image && (
                        <div
                          className="h-40 bg-cover bg-center"
                          style={{ backgroundImage: `url(${story.image})` }}
                        />
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-lg text-gray-800 truncate">
                          {story.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(story.datePosted)}
                        </p>
                        <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                          {story.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Next button */}
                <button
                  onClick={nextSlide}
                  disabled={currentIndex >= maxIndex}
                  className={`absolute right-0 top-1/2 transform -translate-y-1/2 -mr-4 z-10 bg-white rounded-full p-2 shadow-md
                        ${
                          currentIndex >= maxIndex
                            ? "opacity-30 cursor-not-allowed"
                            : "opacity-70 hover:opacity-100"
                        }`}
                  aria-label="Next stories"
                >
                  <ChevronRight size={24} />
                </button>

                {/* Pagination dots */}
                {sortedStories.length > 3 && (
                  <div className="flex justify-center mt-6 gap-2">
                    {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-2 w-2 rounded-full ${
                          idx === currentIndex ? "bg-blue-500" : "bg-gray-300"
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ScholarshipDetailPage;
