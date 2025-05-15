"use client";
import { Event, RSVP, Alumnus } from "@/models/models";
import { Calendar, ChevronDown, ChevronRight, ClipboardList, Clock, FileUser, MapPin, User, Users, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import BookmarkButton from "@/components/ui/bookmark-button";
import { useEvents } from "@/context/EventContext";
import { useAuth } from "@/context/AuthContext";
import { useRsvpDetails } from "@/context/RSVPContext";
import Image from "next/image";
import { useState } from "react";
import { Collapsible, CollapsibleContent } from "@radix-ui/react-collapsible";
import { Button } from "@/components/ui/button";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface EventsProfileListProps
{
  events: Event[];
  isLoading?: boolean;
  type: string;
  emptyMessage?: string;
}

const EventsProfileList = (
{
  events,
  isLoading = false,
  type,
  emptyMessage = "No events found.",
}: EventsProfileListProps) => 
{
  if (isLoading)
  {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="border rounded-lg p-4 shadow-sm animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
            <div className="h-2 bg-gray-200 rounded-full mb-3"></div>
            <div className="flex justify-between mb-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="flex justify-between">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0)
  {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  


    const router = useRouter();
    const { user, alumInfo } = useAuth();
    const { rsvpDetails } = useRsvpDetails();
    const {} = useEvents();

    const handleViewDetails = (eventId: string) => {
        router.push(`/events/${eventId}`);
    };

    const rsvps = rsvpDetails as RSVP[];
    let alumniRsvpStatus: string | undefined = undefined;

    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [isRsvpOpen, setIsRsvpOpen] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [pending, setPending] = useState(true);
    const [accepted, setAccepted] = useState(false);
    const [rejected, setRejected] = useState(false);

    const [activeProposedStatus, setActiveProposedStatus] = useState("pending");
    const handleActiveProposedStatus = (tab: string) => {
        setActiveProposedStatus(tab);
        if(tab === "pending") {handlePending()}
        else if(tab === "accepted") {handleAccepted()}
        else {handleRejected()}
    }

    const handlePending = () => {
        setPending(true);
        setAccepted(false);
        setRejected(false);
    }
    const handleAccepted = () => {
        setPending(false);
        setAccepted(true);
        setRejected(false);
    }
    const handleRejected = () => {
        setPending(false);
        setAccepted(false);
        setRejected(true);
    }

    interface AlumniRsvpDetail {
      id: string;
      image: string,
      email: string,
      name: string;
      rsvpStatus: string;
    }
    
    const [alumniWithRsvp, setAlumniWithRsvp] = useState<AlumniRsvpDetail[]>([]);
    const [loading, setLoading] = useState(false);
    
    // This function handles when an event is clicked
    const handleEventClick = async (event: Event) => {
        setSelectedEvent(event);
        
        if(event.inviteType !== "all"){
            setLoading(true);
            try {
            // Get the alumni details and update state
            const details = await getAlumniWithRsvpStatus(event);
            setAlumniWithRsvp(details);
            } catch (error) {
            console.error("Error fetching alumni details:", error);
            } finally {
            setLoading(false);
            }
        }
        
    };
    
    // Get the alums object from the RSVP
    function alumsRsvp(event: Event) {
        const matchingRsvp = rsvps.find((rsvp) => rsvp.postId === event?.eventId);
        return matchingRsvp?.alums;
    }

    const fetchAlumnusById = async (alumniId: string) => {
        const alumRef = doc(db, "alumni", alumniId);
        const docSnap = await getDoc(alumRef);
        
        if (docSnap.exists()) {
        // Return the entire document data
        return docSnap.data() as Alumnus;
        }
        
        return null; // Return null if document doesn't exist
    };
    
    // Fetch alumni details and combine with RSVP status
    async function getAlumniWithRsvpStatus(event: Event) {
        const alumsData = alumsRsvp(event);
        
        if (!alumsData) {
        return [];
        }
        
        // Process each alumni ID in the RSVP
        const alumniPromises = Object.entries(alumsData).map(async ([alumId, alumData]) => {
        // Fetch the alumnus details from your Alumni collection
        const alumnus = await fetchAlumnusById(alumId);
        
        return {
            id: alumId,
            image: alumnus?.image ?? "",
            email: alumnus?.email ?? "",
            name: alumnus ? (alumnus.firstName + " " + alumnus.lastName) : 'Unknown Alumni',
            // Use the status from the RSVP data
            rsvpStatus: alumData.status
        };
        });
        
        return Promise.all(alumniPromises);
    }


  return (
    <div className="flex items-start w-full min-w-0">
        <div className={`transition-all ease-in-out duration-500 overflow-hidden self-start ${
            selectedEvent !== null ? 'w-0' : 'w-full'
          }`}>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {events.map((event) => {
                const matchingRSVP = rsvps.find((rsvp) => rsvp.postId === event?.eventId);
                if (alumInfo?.alumniId && matchingRSVP?.alums) {
                    alumniRsvpStatus = matchingRSVP.alums[alumInfo.alumniId]?.status;
                } else{
                    alumniRsvpStatus = undefined;
                }
                return(
                
                <div key={event.eventId}
                    className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => {
                        type === "Proposed Events" ? (handleEventClick(event)) 
                        : (handleViewDetails(event.eventId))
                    }}
                >
                    {/* Image */}
                    <div className="relative bg-cover bg-center rounded-t-[10px] h-[230px]">
                    <Image
                        src={event.image || "/ICS3.jpg"}
                        alt={event.title}
                        priority
                        layout="fill"
                        objectFit="cover"
                        className="rounded-t-lg"
                    />
                    {type === "Proposed Events" ? (
                        <span
                        className={`absolute bottom-2 right-2 px-3 py-1 text-sm rounded-full ${(() => {
                            switch (event.status) {
                            case "Accepted":
                                return "bg-green-100 text-green-800 px-2 py-1 font-bold";
                            case "Pending":
                                return "bg-yellow-100 text-yellow-800 px-2 py-1 font-bold";
                            case "Rejected":
                                return "bg-red-100 text-red-800 px-2 py-1 font-bold";
                            default:
                                return "bg-gray-100 text-gray-800 px-2 py-1 font-bold";
                            }
                        })()}`}
                        >
                        {event.status === "Accepted" ? "Approved" : event.status}
                        </span>
                    ) : (
                        type === "Invitations" && (
                        <span
                            className={`absolute bottom-2 right-2 px-3 py-1 text-sm rounded-full ${(() => {
                            switch (alumniRsvpStatus) {
                                case "Accepted":
                                return "bg-green-100 text-green-800 px-2 py-1 font-bold";
                                case "Pending":
                                return "bg-yellow-100 text-yellow-800 px-2 py-1 font-bold";
                                case "Rejected":
                                return "bg-red-100 text-red-800 px-2 py-1 font-bold";
                                default:
                                return "bg-gray-100 text-gray-800 px-2 py-1 font-bold";
                            }
                            })()}`}
                        >
                            {alumniRsvpStatus === "Accepted"
                            ? "Going"
                            : alumniRsvpStatus === "Rejected"
                            ? "Not Going"
                            : alumniRsvpStatus}
                        </span>
                        )
                    )}
                    </div>
                    {/* Content */}
                    <div className="px-6 pt-3 pb-6">
                    {/* Event Title */}
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-xl font-semibold truncate">{event.title}</h2>
                        <BookmarkButton entryId={event.eventId} type="event" size="md" />
                    </div>
                    {/* Details */}
                    <div className="grid grid-cols-6 gap-6 text-xs text-gray-700 mb-3">
                        <div className="flex items-center gap-1 col-span-2">
                        <Calendar className="size-[16px]" />
                        <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-1 col-span-2">
                        <Clock className="size-[16px]" />
                        <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-1 col-span-2">
                        <MapPin className="size-[16px]" />
                        <span>{event.location}</span>
                        </div>
                    </div>
                    {/* Description with View More */}
                    <div className="mb-3 text-sm text-start">
                        <p
                        className={`h-10 overflow-hidden text-clip ${
                            event.description.length > 100 ? "mb-1" : ""
                        }`}
                        >
                        {event.description.length > 100
                            ? event.description.slice(0, 100) + "..."
                            : event.description}
                        </p>

                        <button
                        className="text-xs text-gray-600 hover:text-gray-800 pt-2"
                        onClick={() => (eventId: string) => {
                            router.push(`/events/${eventId}`);
                        }}
                        >
                        View More
                        </button>
                    </div>
                    </div>
                </div>
                
                )

                })}
            </div>
        </div>

        <div
          className={`transition-all ease-in-out duration-500 self-start ${
            selectedEvent !== null ? 'w-full opacity-100' : 'w-0 opacity-0'
          } bg-white rounded-lg` }
        >
            {selectedEvent !== null && (
            <div className="p-5">
                <div className="flex justify-between mb-7">
                    <div className="flex flex-col items-center">
                        <div>
                            {selectedEvent.image !== "" && (
                            <div className="relative w-150 h-70 mb-3">
                                <Image
                                src={selectedEvent.image || "/ICS3.jpg"}
                                alt={selectedEvent.title}
                                priority
                                layout="fill"
                                objectFit="cover"
                                className="rounded-t-lg"
                            />
                            </div>
                            
                            )}
                            <p className="text-xl font-bold">
                            {selectedEvent.title}
                            </p>
                        </div>
                    </div>
                    <XIcon className="text-gray-700 hover:text-red-500 cursor-pointer w-6 h-6" onClick={() => setSelectedEvent(null)}/>
                </div>

                <div className="space-y-2">
                    <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen} className="">
                        <div className="flex items-center">
                            <Button
                            variant="ghost"
                            className={`text-gray-800 flex w-full items-center justify-start gap-2 cursor-pointer hover:bg-gray-100 transition-all duration-300 ease-in-out ${
                                isDetailsOpen ? "bg-gray-100 shadow-sm" : ""
                            }`}
                            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                            >
                            <div className="flex items-center justify-center">
                                {isDetailsOpen ? 
                                <ChevronDown className="w-5 h-5 min-w-5 min-h-5" /> : 
                                <ChevronRight className="w-5 h-5 min-w-5 min-h-5" />
                                }
                            </div>
                            <ClipboardList className="w-5 h-5 min-w-5 min-h-5" />
                            <span className="text-base">Event Details</span>
                            </Button>
                        </div>
                        <CollapsibleContent>
                            <div className="w-full bg-gray-50 p-5 pl-10 mb-8 rounded-lg rounded-t-none ">
                                <p className="text-gray-600 mb-6 text-sm text-justify">
                                {selectedEvent.description}
                                </p>
                                <div className="grid grid-cols-4 text-sm">
                                <div className="col-span-2 flex items-center space-x-2 mb-3">
                                    <Calendar className="w-5 h-5 min-w-5 text-gray-500"/>
                                    <p className="font-light">Date:</p>
                                    <p>{selectedEvent.date}</p>
                                </div>
                                <div className="col-span-2 flex items-center space-x-2">
                                    <Clock className="w-5 h-5 min-w-5 text-gray-500"/>
                                    <p className="font-light">Time:</p>
                                    <p>{selectedEvent.time}</p>
                                </div>
                                <div className="col-span-2 flex items-center space-x-2">
                                    <MapPin className="w-5 h-5 min-w-5 text-gray-500"/>
                                    <p className="font-light">Location:</p>
                                    <p>{selectedEvent.location}</p>
                                </div>
                                <div className="col-span-2 flex items-center space-x-2">
                                    <Users className="w-5 h-5 min-w-5 text-gray-500"/>
                                    <p className="font-light">Number of Attendees:</p>
                                    <p>{selectedEvent.numofAttendees}</p>
                                </div>
                            </div>
                            </div>

                            
                            
                        </CollapsibleContent>
                    </Collapsible>

                    <Collapsible open={isRsvpOpen} onOpenChange={setIsRsvpOpen}>
                        <div className="flex items-center">
                            <Button
                            variant="ghost"
                            className={`text-gray-800 flex w-full items-center justify-start gap-2 cursor-pointer hover:bg-gray-100 transition-all duration-300 ease-in-out ${
                                isRsvpOpen ? "bg-gray-100 shadow-sm" : ""
                            }`}
                            onClick={() => setIsRsvpOpen(!isRsvpOpen)}
                            >
                            <div className="flex items-center justify-center">
                                {isRsvpOpen ? 
                                <ChevronDown className="w-5 h-5 min-w-5 min-h-5" /> : 
                                <ChevronRight className="w-5 h-5 min-w-5 min-h-5" />
                                }
                            </div>
                            <FileUser className="w-5 h-5 min-w-5 min-h-5" />
                            <span className="text-base">RSVPs</span>
                            </Button>
                        </div>
                        <CollapsibleContent>
                            <div className="w-full space-y-4 bg-gray-50 p-5 rounded-lg rounded-t-none">

                                {(selectedEvent.inviteType !== "all" && selectedEvent.status !== "Draft") ? (<>
                                    <div className="flex justify-between items-center">
                                        <div className="space-x-2">
                                            <Button className={`cursor-pointer ${pending ? `bg-amber-200` : `text-gray-500 font-light border border-gray-200`}`} onClick={() => handleActiveProposedStatus("pending")}>Pending</Button>
                                            <Button className={`cursor-pointer ${accepted ? `bg-green-200` : `text-gray-500 font-light border border-gray-200`}`} onClick={() => handleActiveProposedStatus("accepted")}>Going</Button>
                                            <Button className={`cursor-pointer ${rejected ? `bg-red-200` : `text-gray-500 font-light border border-gray-200`}`} onClick={() => handleActiveProposedStatus("rejected")}>Not Going</Button>
                                        </div>
                                        <p className="text-sm text-gray-500">Showing {alumniWithRsvp.filter((item) =>item.rsvpStatus === (activeProposedStatus.charAt(0).toUpperCase() + activeProposedStatus.slice(1))).length} result/s</p>
                                    </div>

                                    {activeProposedStatus && (
                                        alumniWithRsvp.filter((item) =>item.rsvpStatus === (activeProposedStatus.charAt(0).toUpperCase() + activeProposedStatus.slice(1))
                                        ).length === 0 ? (
                                        <p className="text-gray-500 text-center py-4">
                                            No {activeProposedStatus} RSVPs.
                                        </p>
                                        ) : (
                                        alumniWithRsvp.filter((item) =>item.rsvpStatus === (activeProposedStatus.charAt(0).toUpperCase() + activeProposedStatus.slice(1)))
                                            .map((item: AlumniRsvpDetail) => {
                                            return (
                                            <div
                                                key={item.id}
                                                className="rounded-lg p-4 bg-white border border-gray-100 space-y-4"
                                            >

                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 max-w-10 max-h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                        {item?.image ? (
                                                        <img
                                                            src={item.image}
                                                            alt={`${item.name}`}
                                                            width={40}
                                                            height={40}
                                                            className="rounded-full object-cover object-center w-full h-full"
                                                        />
                                                        ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                            <User className="w-5 h-5" />
                                                        </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium">
                                                        {item.name}
                                                        </h4>
                                                        <p className="text-sm text-gray-600">
                                                        {item.email}
                                                        </p>
                                                    </div>
                                                    </div>
                                                </div>
                                            </div>
                                            );
                                            })
                                        )
                                    )}
                                </>) : selectedEvent.status === "Draft" ? (
                                    <p className="pl-5">This event is still a draft. Please wait for the admin's feedback.</p>
                                ) : selectedEvent.inviteType === "all" && (
                                    <p className="pl-5">This event is open to all.</p>
                                )}
                            
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                </div>
            </div>
            )}
        </div>
    </div>
  );
};

export default EventsProfileList;