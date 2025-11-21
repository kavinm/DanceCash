"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Link from "next/link";
import { FaCalendarPlus, FaChartBar, FaUsers, FaEdit } from "react-icons/fa";

// Mock data for studios - in a real app this would come from an API
const mockStudios = [
  {
    id: "studio-1",
    name: "Dance Paradise Studio",
    owner: "Maria Rodriguez",
    location: "Miami, FL",
    events: 24,
    revenue: 12500,
    dancers: 320
  },
  {
    id: "studio-2",
    name: "Rhythm & Moves Studio",
    owner: "James Wilson",
    location: "New York, NY",
    events: 18,
    revenue: 8200,
    dancers: 195
  },
  {
    id: "studio-3",
    name: "Latin Fire Dance Hall",
    owner: "Carlos & Sofia",
    location: "Los Angeles, CA",
    events: 32,
    revenue: 15400,
    dancers: 450
  }
];

// Mock data for events for a specific studio
const mockStudioEvents = [
  {
    id: "event-1",
    title: "Bachata Sensation Festival",
    date: "2024-12-15",
    time: "19:00",
    attendees: 145,
    revenue: 7250,
    status: "upcoming"
  },
  {
    id: "event-2", 
    title: "Weekly Bachata Class",
    date: "2024-12-20",
    time: "18:30",
    attendees: 22,
    revenue: 330,
    status: "upcoming"
  },
  {
    id: "event-3",
    title: "Salsa & Bachata Fusion Night",
    date: "2024-11-15",
    time: "20:00",
    attendees: 89,
    revenue: 2225,
    status: "completed"
  }
];

export default function StudiosPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStudio, setSelectedStudio] = useState(mockStudios[0]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Studio Dashboard</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-4 mb-6">
            {mockStudios.map((studio) => (
              <button
                key={studio.id}
                onClick={() => setSelectedStudio(studio)}
                className={`px-4 py-2 rounded-md font-medium ${
                  selectedStudio.id === studio.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {studio.name}
              </button>
            ))}
            
            <Link 
              href="/studios/create"
              className="px-4 py-2 rounded-md font-medium bg-green-600 text-white hover:bg-green-700 flex items-center"
            >
              <FaCalendarPlus className="mr-2" />
              Add Studio
            </Link>
          </div>
          
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-6">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'dashboard'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'events'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Events
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Analytics
              </button>
            </nav>
          </div>
          
          {/* Dashboard View */}
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Dashboard - {selectedStudio.name}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="text-3xl font-bold text-blue-800">{selectedStudio.events}</div>
                  <div className="text-blue-600">Total Events</div>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="text-3xl font-bold text-green-800">${selectedStudio.revenue.toLocaleString()}</div>
                  <div className="text-green-600">Total Revenue</div>
                </div>
                
                <div className="bg-purple-50 p-6 rounded-lg">
                  <div className="text-3xl font-bold text-purple-800">{selectedStudio.dancers}</div>
                  <div className="text-purple-600">Total Dancers</div>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendees</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mockStudioEvents
                        .filter(event => event.status === 'upcoming')
                        .map((event) => (
                          <tr key={event.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.title}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.attendees}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${event.revenue}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {event.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button className="text-blue-600 hover:text-blue-900 mr-3">
                                <FaEdit />
                              </button>
                              <Link href={`/event/${event.id}`} className="text-green-600 hover:text-green-900">
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* Events View */}
          {activeTab === 'events' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">All Events</h2>
                <Link 
                  href="/studios/create-event"
                  className="px-4 py-2 rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700 flex items-center"
                >
                  <FaCalendarPlus className="mr-2" />
                  Create Event
                </Link>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendees</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockStudioEvents.map((event) => (
                      <tr key={event.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.attendees}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${event.revenue}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            event.status === 'completed' 
                              ? 'bg-gray-100 text-gray-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {event.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            <FaEdit />
                          </button>
                          <Link href={`/event/${event.id}`} className="text-green-600 hover:text-green-900">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Analytics View */}
          {activeTab === 'analytics' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Analytics Dashboard</h2>
              <p className="text-gray-600 mb-6">Comprehensive analytics for your studio's performance and events.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-lg mb-4">Revenue Chart</h3>
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64 flex items-center justify-center">
                    Revenue Chart Visualization
                  </div>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-lg mb-4">Attendance Trends</h3>
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64 flex items-center justify-center">
                    Attendance Chart Visualization
                  </div>
                </div>
              </div>
              
              <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-4">Revenue Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">72%</div>
                    <div className="text-gray-600">BCH Payments</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-green-600">28%</div>
                    <div className="text-gray-600">Fiat Payments</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">15%</div>
                    <div className="text-gray-600">Repeat Dancers</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}