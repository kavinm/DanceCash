import EventCard from "./EventCard";

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
    description: "Join us for an amazing evening of Bachata dancing with world-class instructors and performers.",
    image: "https://images.unsplash.com/photo-1542662565-7e4e66d9d8f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
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
    description: "Beginner-friendly Bachata class every Friday. Learn the basics and advanced moves.",
    image: "https://images.unsplash.com/photo-1519582811669-7bf43f33cb81?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
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
    description: "An exciting fusion of Salsa and Bachata with live music and professional dancers.",
    image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    isRecurring: false,
    danceStyle: "Salsa/Bachata"
  }
];

export default function EventList() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upcoming Dance Events</h1>
        <p className="text-gray-600">Find and book your next dance adventure</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}