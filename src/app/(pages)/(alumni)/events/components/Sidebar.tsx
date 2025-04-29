// event-list/components/EventSidebar.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {CalendarCheck, Bookmark, Mailbox, BookOpen, FileText, LucideIcon} from "lucide-react"

type SidebarItem =
{
    id: "all" | "invites" | "saved" | "proposed" | "featured";
    label: string;
    href: string;
    icon: LucideIcon;
};

interface EventSidebarProps
{
    onTabChange?: (tab: "all" | "invites" | "saved" | "proposed" | "featured") => void;
    activeTab?: "all" | "invites" | "saved" | "proposed" | "featured";
}

const EventSidebar = ({ onTabChange, activeTab = "all" }: EventSidebarProps) =>
{
    const pathname = usePathname();
    const [selectedItem, setSelectedItem] = useState<"all" | "invites" | "saved" | "proposed" | "featured">(activeTab);

    const sidebarItems: SidebarItem[] = 
    [
        { id: 'all', label: 'All Events', href: '/events', icon: CalendarCheck},
        { id: 'saved', label: 'Saved Events', href: '/events/saved', icon: Bookmark},
        { id: 'proposed', label: 'Proposed Events', href: '/events/proposed', icon: FileText},
        { id: 'invites', label: 'Invitations', href: '/events/invitations', icon: Mailbox},
        { id: 'featured', label: 'Featured Stories', href: '/events/featured', icon: BookOpen},
    ];

    useEffect(() =>
    {
        if (activeTab)
        {
            setSelectedItem(activeTab);
        } 
        
        else 
        {
            const currentItem = sidebarItems.find(item => pathname === item.href);
            if (currentItem)
            {
                setSelectedItem(currentItem.id);
            }

            else if(pathname.includes('/events'))
            {
                setSelectedItem('all');
            }
        }
    }, [pathname, activeTab]);

    const handleItemClick = (item: SidebarItem) =>
    {
        setSelectedItem(item.id);
        if (onTabChange)
        {
            onTabChange(item.id);
        }
    };

    return (
        <div className='bg-[#FFFFFF]'>
            <ul className="flex flex-col p-1 gap-[10px] rounded-[10px] w-content h-max ">
                {sidebarItems.map((item) =>
                {
                    const Icon = item.icon;
                    const isActive = selectedItem === item.id;
                    
                    return(
                        <li key={item.id}>
                            <Link className='flex gap-5 items-center justify-start' href={item.href} onClick={() => handleItemClick(item)} >
                                <Icon />
                                <p className={`group w-max relative py-1 transition-all ${isActive ? 'font-semibold  border-b-3 border-blue-500' : 'text-gray-700 group'}`}>
                                    <span>{item.label}</span>
                                    {!isActive && (<span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>)}
                                </p>
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </div>
    );
};

export default EventSidebar;