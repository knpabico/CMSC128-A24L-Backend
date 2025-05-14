// donationdrive-list/saved/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useDonationDrives } from '@/context/DonationDriveContext';
import { useAuth } from '@/context/AuthContext';
import { useBookmarks } from '@/context/BookmarkContext';
import DonationDriveSidebar from '../components/Sidebar';
import DonationDrivesList from '../components/DonationDrivesList';
import { DonationDrive, Featured } from '@/models/models';
import { useFeatured } from '@/context/FeaturedStoryContext';
import { useRouter } from "next/navigation";
import { Calendar, ChevronDown } from 'lucide-react';
import { error } from 'console';
import { formatDate } from '@/utils/formatDate';
import Banner from '@/components/Banner';

export default function DonationFeaturedDonationPage() {
	const router = useRouter();
	const { loading, error } = useDonationDrives();
	const { featuredItems, isLoading: featuredLoading } = useFeatured();
	const [donationDriveStories, setdonationDriveStories] = useState<Featured[]>([]);
	const [sortOrder, setSortOrder] = useState< "latest" | "oldest" >("latest");

	// Sort
	type SortOption = "latest" | "oldest";
	interface SortControlProps {
		sortOrder: SortOption;
		setSortOrder: (order: SortOption) => void;
	}
	const SortControlDropdown = ({
		sortOrder = "latest",
		setSortOrder,
	}: SortControlProps) => {
		const [isOpen, setIsOpen] = useState(false);
		const toggleDropdown = () => setIsOpen(!isOpen);
		const selectOption = (option: SortOption) => {
			setSortOrder(option);
			setIsOpen(false);
		};
		const getDisplayText = () => {
			switch (sortOrder) {
				case "latest":
					return "Latest first";
				case "oldest":
					return "Oldest first";
				default:
					return "Latest first";
			}
		};
		return (
			<div className="flex items-center gap-2">
				<span className="text-sm font-medium text-gray-700">Sort:</span>

				<div className="relative">
					<button
						onClick={toggleDropdown}
						className="flex items-center justify-between min-w-36 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
						aria-haspopup="listbox"
						aria-expanded={isOpen}
					>
						<span className="text-gray-900">{getDisplayText()}</span>
						<ChevronDown
							size={16}
							className={`text-gray-500 transition-transform ${
								isOpen ? "rotate-180" : ""
							}`}
						/>
					</button>

					{isOpen && (
						<div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
							<ul className="py-1" role="listbox">
								<li role="option" aria-selected={sortOrder === "latest"}>
									<button
										className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
											sortOrder === "latest"
												? "bg-blue-50 text-blue-600"
												: "text-gray-700"
										}`}
										onClick={() => selectOption("latest")}
									>
										Latest first
									</button>
								</li>
								<li role="option" aria-selected={sortOrder === "oldest"}>
									<button
										className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
											sortOrder === "oldest"
												? "bg-blue-50 text-blue-600"
												: "text-gray-700"
										}`}
										onClick={() => selectOption("oldest")}
									>
										Oldest first
									</button>
								</li>
							</ul>
						</div>
					)}
				</div>
			</div>
		);
	};

	useEffect(() => {
			// Filter featured items with type "donationDrive"
			if (featuredItems && featuredItems.length > 0) {
				const filteredStories = featuredItems.filter(
					(item: Featured) =>
						item.type === "donation"
				);
				setdonationDriveStories(filteredStories);
			}
		}, [featuredItems]);
	
		const navigateToFeaturedDetail = (featuredId: string) => {
			router.push(`/donationdrive-list/featured/${featuredId}`);
		};

		if (loading || featuredLoading)
			return (
				<div className="flex justify-center p-8">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
				</div>
			);

		if (error) return <div className="text-red-500 text-center p-8">{error}</div>;

		const sorteddonationDriveStories = [...donationDriveStories].sort((a, b) => {
			const dateA = new Date(a.datePosted).getTime();
	
			const dateB = new Date(b.datePosted).getTime();
	
			return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
		});
		
		return (
			<div className="bg-[#EAEAEA]">
				{/*Page Title*/}
				<Banner 
					title="Donation Drives" 
					description="Support meaningful causes through ICS and alumni donation drives, helping create opportunities and making a lasting impact."
				/>
				{/* Body */}
				<div className='my-[40px] mx-[30px] h-fit flex flex-col gap-[40px] md:flex-row lg:mx-[50px] xl:mx-[200px] static'>
					{/* Sidebar */}
					<div className='bg-[#FFFFFF] flex flex-col p-7 gap-[10px] rounded-[10px] w-content h-max md:sticky md:top-1/7'>
						<DonationDriveSidebar />
					</div>
					{/* Main content */}
					<div className='flex flex-col gap-[10px] w-full mb-10'>
						{/* Filter tabs */}
						<div className="bg-[#FFFFFF] rounded-[10px] px-5 py-1 flex justify-between items-center shadow-md border border-gray-200">
							<h2 className="text-lg font-semibold">Featured Stories</h2>
							<div className="flex items-center">
								<label htmlFor="sort" className="mr-2 text-sm">Sort by:</label>
								{/* <select id="sort" value={sortOption} onChange={handleSortChange} className="flex items-center text-sm" > */}
								<SortControlDropdown
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
              />
							</div>
						</div>
						{sorteddonationDriveStories.length > 0 ? (
							<>
								<div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
                  {sorteddonationDriveStories.map((story: Featured) => (
                    <div
                      key={story.featuredId}
                      className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateToFeaturedDetail(story.featuredId)}
                    >
                      {/* Image */}
                      <div
                        className="relative bg-cover bg-center rounded-t-[10px] h-[230px]"
                        style={{
                          backgroundImage: `url("${
                            story.image || "/ICS3.jpg"
                          }")`,
                        }}
                      />
                      {/* Body */}
                      <div className="px-6 pt-3 pb-6">
                        {/* Title */}
                        <div className="flex justify-between items-center mb-2">
                          <h2 className="text-xl font-semibold truncate">
                            {story.title}
                          </h2>
                        </div>
                        {/* Description */}
                        <div className="mb-5 text-sm h-20 overflow-hidden text-clip">
                          <p className="text-start">
                            {story.text && story.text.length > 150
                              ? story.text.slice(0, 150) + "..."
                              : story.text}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 w-full items-center">
                          {/* Date */}
                          <div className="flex items-center gap-1">
                            <Calendar size={16} />
                            <p className="text-sm text-gray-600">
                              {formatDate(story.datePosted)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
							</>
						) : (
							<div className="text-center py-12 bg-gray-50 rounded-lg w-full">
								<h3 className="text-xl font-medium text-gray-600">No donation drive stories found</h3>
								<p className="text-gray-500 mt-2">There are no featured stories yet.</p>
							</div>
						)}
					</div>
				</div>
			</div>
			);
}

