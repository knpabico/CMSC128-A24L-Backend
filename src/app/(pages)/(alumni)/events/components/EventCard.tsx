"use client";

import { useRouter } from 'next/navigation';
import { Event } from '@/models/models';
import BookmarkButton from '@/components/ui/bookmark-button';
import { useEvents } from '@/context/EventContext';
import { useAuth } from '@/context/AuthContext';
import { Users, Clock, MapPin, Calendar, ImageOff } from "lucide-react"
import { useEffect } from 'react';
import { Timestamp } from 'firebase-admin/firestore';

interface EventCardProps
{
    event: Event;
    showBookmark?: boolean;
}

const EventCard = ({ event, showBookmark = false }: EventCardProps) =>
{
    const router = useRouter();
    const {user, alumInfo} = useAuth();
    const
    {

    } = useEvents();

    const formatDate = (timestamp: any) =>
    {
        try
        {
            if(!timestamp) return 'N/A';
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleDateString('en-US',
            {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        }

        catch (err)
        {
            return 'Invalid Date';
        }
    };

    const handleViewDetails = (eventId: string) =>
    {
        router.push(`/events/details?id=${eventId}`);
    };

    return(
        <div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewDetails(event.eventId)} >
                {/* Image */}
                <div className="relative bg-cover bg-center rounded-t-[10px] h-[230px]" style={{ backgroundImage: 'url("/ICS3.jpg")' }}>
                    <span className={`absolute bottom-2 right-2 px-3 py- text-sm rounded-full ${
                        event.status === 'approved'
                            ? 'bg-green-100 text-green-800 px-2 py-1 font-bold'
                            : event.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 px-2 py-1 font-bold'
                            : event.status === 'declined'
                            ? 'bg-red-100 text-red-800 px-2 py-1 font-bold'
                            : 'bg-gray-100 text-gray-800'
                    }`}>
                        {event.status === 'approved' ? 'Closed' : event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                </div>
            </div>
        </div>
    );
};    