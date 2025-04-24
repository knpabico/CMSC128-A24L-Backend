// donationdrive-list/components/DonationDriveSidebar.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type SidebarItem = {
  id: string;
  label: string;
  href: string;
};

const DonationDriveSidebar = () => {
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState('');

  const sidebarItems: SidebarItem[] = [
    { id: 'all', label: 'All Donation Drives', href: '/donationdrive-list' },
    { id: 'event', label: 'Event Related Drives', href: '/donationdrive-list/event-related' },
    { id: 'saved', label: 'Saved Drives', href: '/donationdrive-list/saved' },
    { id: 'proposed', label: 'Proposed Drives', href: '/donationdrive-list/proposed' },
    { id: 'featured', label: 'Featured Stories', href: '/donationdrive-list/featured' },
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
    <div className="donation-drive-sidebar">
      <nav>
        <ul className="space-y-2">
          {sidebarItems.map((item) => (
            <li key={item.id}>
              <Link 
                href={item.href}
                className={`block p-2 rounded ${activeItem === item.id ? 'bg-muted font-medium' : ''}`}
                onClick={() => setActiveItem(item.id)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default DonationDriveSidebar;