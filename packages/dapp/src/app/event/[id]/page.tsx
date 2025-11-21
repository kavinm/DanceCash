"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCalendar, FaClock, FaMapMarkerAlt, FaDollarSign, FaUserFriends } from "react-icons/fa";
import ConnectButton from "@/components/ConnectButton";
import Link from "next/link";

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
    danceStyle: "Bachata",
    instructor: "Maria Rodriguez",
    additionalInfo: "Please bring water and wear comfortable dance shoes. Beginners welcome!",
    maxCapacity: 200,
    currentlyRegistered: 145
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
    danceStyle: "Bachata",
    instructor: "James Wilson",
    additionalInfo: "All skill levels welcome. No partner needed.",
    maxCapacity: 30,
    currentlyRegistered: 22
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
    danceStyle: "Salsa/Bachata",
    instructor: "Carlos Mendez & Sofia Lopez",
    additionalInfo: "Beginners workshop starts at 7 PM. Advanced class at 9 PM.",
    maxCapacity: 150,
    currentlyRegistered: 89
  }
];

export default function EventDetailPage() {
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
        <div className="text-2xl">Loading event...</div>
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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="text-blue-600 hover:underline flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Events
          </Link>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <img 
            src={event.image} 
            alt={event.title} 
            className="w-full h-96 object-cover"
          />
          
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
                <div className="flex items-center mb-4">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold mr-3">
                    {event.danceStyle}
                  </span>
                  <span className="text-gray-600">
                    <FaUserFriends className="inline mr-1" />
                    {event.currentlyRegistered}/{event.maxCapacity} registered
                  </span>
                </div>
              </div>
              
              <div className="bg-green-100 text-green-800 px-4 py-3 rounded-lg">
                <div className="text-sm">Price</div>
                <div className="text-2xl font-bold">${event.price}</div>
                {event.price > 0 && (
                  <div className="text-xs">with 10% BCH discount: ${event.price * 0.9}</div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Event Details</h2>
                <p className="text-gray-700 mb-4">{event.description}</p>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Additional Information</h3>
                <p className="text-gray-700 mb-6">{event.additionalInfo}</p>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">About the Instructor</h3>
                <p className="text-gray-700 mb-6">Led by {event.instructor}, an experienced dance professional with over 10 years in the industry.</p>
              </div>
              
              <div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Information</h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-700">
                      <FaCalendar className="mr-3 text-blue-500" />
                      <span>{eventDate}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <FaClock className="mr-3 text-blue-500" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <FaMapMarkerAlt className="mr-3 text-blue-500" />
                      <span>{event.venue}, {event.location}</span>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700">Spots available:</span>
                      <span className="font-medium">{event.maxCapacity - event.currentlyRegistered} left</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${(event.currentlyRegistered / event.maxCapacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-3">
                    <Link 
                      href={`/register/${event.id}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-center py-3 px-4 rounded-md font-medium transition-colors duration-300"
                    >
                      Register Now
                    </Link>
                    <ConnectButton />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}