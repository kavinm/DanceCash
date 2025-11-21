import Link from "next/link";
import { FaCalendar, FaClock, FaMapMarkerAlt, FaDollarSign } from "react-icons/fa";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  price: number;
  description: string;
  image: string;
  isRecurring: boolean;
  danceStyle: string;
}

export default function EventCard({ event }: { event: Event }) {
  const eventDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img 
          src={event.image} 
          alt={event.title} 
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {event.danceStyle}
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <FaCalendar className="mr-2 text-blue-500" />
            <span>{eventDate}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FaClock className="mr-2 text-blue-500" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FaMapMarkerAlt className="mr-2 text-blue-500" />
            <span>{event.venue}, {event.location}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <FaDollarSign className="text-green-600 mr-1" />
            <span className="font-bold text-lg">${event.price}</span>
            {event.isRecurring && (
              <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                Recurring
              </span>
            )}
          </div>
          
          <Link 
            href={`/event/${event.id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-300"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}