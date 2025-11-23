"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCalendar, FaClock, FaMapMarkerAlt, FaDollarSign, FaUserFriends } from "react-icons/fa";
import ConnectButton from "@/components/ConnectButton";
import Link from "next/link";

export default function EventDetailPage() {
  const { id } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events?id=${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch event');
        }
        const eventData = await response.json();
        setEvent(eventData);
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
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
            src={event.image || "https://images.unsplash.com/photo-1542662565-7e4e66d9d8f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
            alt={event.title}
            className="w-full h-96 object-cover"
          />

          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
                <div className="flex items-center mb-4">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold mr-3">
                    {event.danceStyle || "Dance Event"}
                  </span>
                  <span className="text-gray-600">
                    <FaUserFriends className="inline mr-1" />
                    {event.currentlyRegistered || 0}/{event.maxCapacity || "N/A"} registered
                  </span>
                </div>
              </div>

              <div className="bg-green-100 text-green-800 px-4 py-3 rounded-lg">
                <div className="text-sm">Price</div>
                <div className="text-2xl font-bold">${event.price || 0}</div>
                {event.price > 0 && (
                  <div className="text-xs">with 10% BCH discount: ${(event.price * 0.9).toFixed(2)}</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Event Details</h2>
                <p className="text-gray-700 mb-4">{event.description || "Event details coming soon."}</p>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">Additional Information</h3>
                <p className="text-gray-700 mb-6">{event.additionalInfo || "No additional information provided."}</p>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">About the Instructor</h3>
                <p className="text-gray-700 mb-6">Led by {event.instructor || "our experienced instructor"}, an experienced dance professional.</p>
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
                      <span>{event.startTime || "TBD"}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <FaMapMarkerAlt className="mr-3 text-blue-500" />
                      <span>{event.venue || "TBD"}, {event.location?.city ? `${event.location.city}, ${event.location.state}` : event.location || "TBD"}</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700">Spots available:</span>
                      <span className="font-medium">{event.maxCapacity ? event.maxCapacity - (event.currentlyRegistered || 0) : "N/A"} left</span>
                    </div>
                    {event.maxCapacity && (
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${((event.currentlyRegistered || 0) / event.maxCapacity) * 100}%` }}
                        ></div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-3">
                    <Link
                      href={`/register/${event._id || id}`}
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