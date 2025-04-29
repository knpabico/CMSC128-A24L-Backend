// donationdrive-list/components/DonationDriveSidebar.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, Bookmark, HandHeart, BookOpen, FileText, LucideIcon, Heart} from "lucide-react"

type SidebarItem = {
	id: string;
	label: string;
	href: string;
	icon: LucideIcon;
};

const DonationDriveSidebar = () => {
const pathname = usePathname();
const [activeItem, setActiveItem] = useState('');

const sidebarItems: SidebarItem[] = [
	{ id: 'all', label: 'All Donation Drives', href: '/donationdrive-list', icon: HandHeart},
	{ id: 'event', label: 'Event Related Drives', href: '/donationdrive-list/event-related', icon: CalendarDays},
	{ id: 'saved', label: 'Saved Drives', href: '/donationdrive-list/saved', icon: Bookmark },
	// { id: 'proposed', label: 'Proposed Drives', href: '/donationdrive-list/proposed', icon: FileText},
	{ id: 'donations', label: 'Your Donations', href: '/donationdrive-list/donations', icon: Heart},
	{ id: 'featured', label: 'Featured Stories', href: '/donationdrive-list/featured', icon: BookOpen},
];

useEffect(() => {
	// Set active item based on current path
	const currentItem = sidebarItems.find(item => pathname === item.href);
	if (currentItem) {
	setActiveItem(currentItem.id);
	} else if (pathname.includes('/donationdrive-list')) {
	// Default to 'all' if on a subpage not in our list
	setActiveItem('all');
	}
}, [pathname]);

	return (
		<div className='bg-[#FFFFFF]'>
			<ul className="flex flex-col p-1 gap-[10px] rounded-[10px] w-content h-max ">
				{sidebarItems.map((item) => {
					const Icon = item.icon;
					return(
						<li key={item.id}>
							<Link className='flex gap-5 items-center justify-start' href={item.href} onClick={() => setActiveItem(item.id)} >
								<Icon />
								<p className={`group w-max relative py-1 transition-all ${activeItem === item.id ? 'font-semibold  border-b-3 border-blue-500' : 'text-gray-700 group'}`}>
									<span>{item.label}</span>
									{activeItem !== item.id && (<span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>)}
								</p>
							</Link>
						</li>
					)
				})}
			</ul>
		</div>
	);
	// return(
	// 	<div>
	// 		<nav className='bg-[#FFFFFF] flex flex-col p-7 gap-[10px] rounded-[10px] w-content h-max'>
	// 			<ul className="flex gap-5 items-center">
	// 				<CalendarDays />
	// 				<Link onClick={() => setActiveItem('all')} href={'/donationdrive-list'}>
	// 					<p className="group relative w-max">
	// 						<span>All Events</span>
	// 						<span className="absolute -bottom-1 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
	// 					</p>
	// 				</Link>
	// 			</ul>
	// 		</nav>
	// 	</div>
	// );
};

export default DonationDriveSidebar;