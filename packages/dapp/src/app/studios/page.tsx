"use client";

import { useState, useEffect } from "react";
import { useWeb3ModalConnectorContext } from "@bch-wc2/web3modal-connector";
import Header from "@/components/Header";
import Link from "next/link";
import { FaCalendarPlus, FaChartBar, FaUsers, FaEdit, FaDollarSign, FaMoneyBillWave } from "react-icons/fa";

export default function StudioDashboard() {
  const { address, isConnected } = useWeb3ModalConnectorContext();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Fetch studio data from API
  const [studioData, setStudioData] = useState<any>({});
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, we would fetch the studio's data from an API
        // This would include the studio's events and analytics
        // For now, we'll fetch events from the API
        const eventsResponse = await fetch(`/api/events?organizerId=${address}`);
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          setEvents(eventsData.events || []);

          // Calculate studio analytics from events
          const totalEvents = eventsData.events?.length || 0;
          const totalRevenue = eventsData.events?.reduce((sum: number, event: any) => sum + (event.price || 0), 0) || 0;
          const totalDancers = eventsData.events?.reduce((sum: number, event: any) => sum + (event.currentlyRegistered || 0), 0) || 0;

          setStudioData({
            name: address ? `${address.substring(0, 10)}...` : "Unknown Studio", // In a real app, this would be the studio name from a profile
            events: totalEvents,
            revenue: totalRevenue,
            dancers: totalDancers,
            upcomingEvents: eventsData.events ? eventsData.events.slice(0, 2) : [],
          });
        }
      } catch (error) {
        console.error('Error fetching studio data:', error);
        // Set default empty data
        setStudioData({
          name: address ? `${address.substring(0, 10)}...` : "Unknown Studio",
          events: 0,
          revenue: 0,
          dancers: 0,
          upcomingEvents: [],
        });
      } finally {
        setLoading(false);
      }
    };

    if (address && isConnected) {
      fetchData();
    }
  }, [address, isConnected]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Studio Dashboard</h1>
            <p className="text-gray-600 mb-6">Please connect your BCH wallet to access your studio dashboard</p>
            <div className="text-gray-500 mb-6">Connect through your BCH wallet to verify you're a studio owner</div>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading Studio Data...</h1>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Studio Dashboard - {studioData.name || address?.substring(0, 10)}</h1>
            <Link
              href="/studios/create-event"
              className="px-4 py-2 rounded-md font-medium bg-green-600 text-white hover:bg-green-700 flex items-center"
            >
              <FaCalendarPlus className="mr-2" />
              Create Event
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="text-3xl font-bold text-blue-800">{studioData.events || 0}</div>
                  <div className="text-blue-600">Total Events</div>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="text-3xl font-bold text-green-800">${(studioData.revenue || 0).toLocaleString()}</div>
                  <div className="text-green-600">Total Revenue</div>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg">
                  <div className="text-3xl font-bold text-purple-800">{studioData.dancers || 0}</div>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Signups</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {studioData.upcomingEvents?.map((event: any) => (
                        <tr key={event._id || event.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.title || event.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(event.date).toLocaleDateString() || event.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.currentlyRegistered || 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${event.price || 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">
                              <FaEdit />
                            </button>
                            <Link href={`/event/${event._id || event.id}`} className="text-green-600 hover:text-green-900">
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                      {(!studioData.upcomingEvents || studioData.upcomingEvents.length === 0) && (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                            No events found. Create your first event!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Revenue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Today</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${Math.round((studioData.revenue || 0) * 0.1)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${Math.round((studioData.revenue || 0) * 0.09)}</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">This Week</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${Math.round((studioData.revenue || 0) * 0.5)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${Math.round((studioData.revenue || 0) * 0.45)}</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">This Month</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${studioData.revenue?.toLocaleString() || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${Math.round((studioData.revenue || 0) * 0.9)?.toLocaleString() || 0}</td>
                      </tr>
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
                <h2 className="text-xl font-semibold text-gray-900">Manage Events</h2>
                <Link
                  href="/studios/create-event"
                  className="px-4 py-2 rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700 flex items-center"
                >
                  <FaCalendarPlus className="mr-2" />
                  Create New Event
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Signups</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {events.map((event) => (
                      <tr key={event._id || event.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.currentlyRegistered || 0}/{event.maxCapacity || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${event.price || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            event.status === 'completed'
                              ? 'bg-gray-100 text-gray-800'
                              : event.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {event.status || 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            <FaEdit />
                          </button>
                          <Link href={`/event/${event._id || event.id}`} className="text-green-600 hover:text-green-900">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {events.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                          No events found. Create your first event!
                        </td>
                      </tr>
                    )}
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
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="h-64 flex items-center justify-center">
                      <p className="text-gray-500">Revenue chart visualization would appear here</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-lg mb-4">Attendance Trends</h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="h-64 flex items-center justify-center">
                      <p className="text-gray-500">Attendance trends would appear here</p>
                    </div>
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