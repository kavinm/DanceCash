"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

// Mock data for events - in a real app this would come from an API
const mockEvents = [
  {
    id: "event-1",
    title: "Bachata Sensation Festival",
    date: "2024-12-15",
    time: "19:00",
    venue: "Dance Paradise Studio",
    location: "Miami, FL",
    price: 50,
    description: "Join us for an amazing evening of Bachata dancing with world-class instructors and performers. This festival features live music, masterclasses, and a grand dance competition.",
    image: "https://images.unsplash.com/photo-1542662565-7e4e66d9d8f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    isRecurring: false,
    danceStyle: "Bachata"
  },
  {
    id: "event-2", 
    title: "Weekly Bachata Class",
    date: "2024-12-20",
    time: "18:30",
    venue: "Rhythm & Moves Studio",
    location: "New York, NY",
    price: 15,
    description: "Beginner-friendly Bachata class every Friday. Learn the basics and advanced moves with experienced instructors.",
    image: "https://images.unsplash.com/photo-1519582811669-7bf43f33cb81?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    isRecurring: true,
    danceStyle: "Bachata"
  },
  {
    id: "event-3",
    title: "Salsa & Bachata Fusion Night",
    date: "2024-12-22",
    time: "20:00",
    venue: "Latin Fire Dance Hall",
    location: "Los Angeles, CA",
    price: 25,
    description: "An exciting fusion of Salsa and Bachata with live music and professional dancers. Learn new moves and enjoy the evening.",
    image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    isRecurring: false,
    danceStyle: "Salsa/Bachata"
  }
];

export default function ConfirmationPage() {
  const { id } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Find the event by ID from our mock data
    const foundEvent = mockEvents.find((e) => e.id === id);
    setEvent(foundEvent);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl">Loading confirmation...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl text-red-500">Event not found</div>
      </div>
    );
  }

  const eventDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div className="mx-auto flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Registration Confirmed!</h1>
        <p className="text-gray-600 mb-6">You're all set for the event. Check your email for details.</p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-lg text-gray-900 mb-2">{event.title}</h2>
          <p className="text-gray-700 text-sm mb-1">{eventDate} at {event.time}</p>
          <p className="text-gray-700 text-sm">{event.venue}, {event.location}</p>
        </div>
        
        <div className="space-y-3">
          <Link 
            href={`/event/${id}`}
            className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors duration-300"
          >
            View Event Details
          </Link>
          
          <Link 
            href="/"
            className="block w-full py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md font-medium transition-colors duration-300"
          >
            Browse More Events
          </Link>
        </div>
      </div>
    </div>
  );
}