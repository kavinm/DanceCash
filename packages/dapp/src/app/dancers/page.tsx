"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Link from "next/link";
import { useWeb3ModalConnectorContext } from "@bch-wc2/web3modal-connector";
import { FaCalendar, FaClock, FaMapMarkerAlt, FaDollarSign, FaUser, FaTicketAlt } from "react-icons/fa";

export default function DancersPage() {
  const { address, isConnected } = useWeb3ModalConnectorContext();
  const [activeTab, setActiveTab] = useState('my-tickets');
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [ownedTokenIds, setOwnedTokenIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!isConnected || !address) {
        setLoading(false);
        return;
      }

      try {
        let tokenIds: string[] = [];
        try {
          const tokensResponse = await fetch(`/api/wallet/tokens?address=${encodeURIComponent(address)}`);
          if (tokensResponse.ok) {
            const tokensData = await tokensResponse.json();
            tokenIds = (tokensData.tokens || []).map((token: any) => token.tokenId);
            setOwnedTokenIds(tokenIds);
          }
        } catch (error) {
          console.error('Error fetching wallet tokens:', error);
        }

        if (tokenIds.length) {
          const ticketsResponse = await fetch(`/api/tickets?tokenIds=${encodeURIComponent(tokenIds.join(','))}`);
          if (ticketsResponse.ok) {
            const ticketsData = await ticketsResponse.json();
            setMyTickets(ticketsData.tickets || []);
          }
        } else {
          setMyTickets([]);
        }

        // Fetch events the user has registered for
        const eventsResponse = await fetch(`/api/events?participant=${encodeURIComponent(address)}`);
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          setMyEvents(eventsData.events || []);
        }
      } catch (error) {
        console.error('Error fetching dancer data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isConnected, address]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your information...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Dancer Dashboard</h1>
            <p className="text-gray-600 mb-6">Connect your wallet to view your tickets and registered events</p>
            <div className="text-gray-500 mb-6">
              <FaTicketAlt className="inline-block mr-2 text-2xl text-blue-500" />
              Connect with your BCH wallet to manage your dance events
            </div>
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
            <h1 className="text-3xl font-bold text-gray-900">Dancer Dashboard - {address?.substring(0, 10)}...</h1>
            <div className="flex items-center">
              <FaUser className="text-blue-500 mr-2" />
              <span className="text-gray-600">Connected</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('my-tickets')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my-tickets'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Tickets
              </button>
              <button
                onClick={() => setActiveTab('my-events')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my-events'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Events
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Profile & Settings
              </button>
            </nav>
          </div>

          {/* My Tickets View */}
          {activeTab === 'my-tickets' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">My Event Tickets</h2>
              {myTickets.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {myTickets.map((ticket) => (
                        <tr key={ticket._id || ticket.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ticket.eventTitle || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(ticket.eventDate).toLocaleDateString() || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.venue || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              ticket.status === 'used' 
                                ? 'bg-gray-100 text-gray-800' 
                                : ticket.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {ticket.status || 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <Link href={`/event/${ticket.eventId}`} className="text-blue-600 hover:text-blue-900">
                              View Event
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaTicketAlt className="mx-auto text-gray-400 text-4xl mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No tickets yet</h3>
                  <p className="text-gray-500 mb-4">You haven't registered for any events yet.</p>
                  <Link 
                    href="/"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Browse Events
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* My Events View */}
          {activeTab === 'my-events' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Registered Events</h2>
              {myEvents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {myEvents.map((event) => (
                        <tr key={event._id || event.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.startTime || 'TBD'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.venue || 'TBD'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              new Date(event.date) < new Date()
                                ? 'bg-gray-100 text-gray-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {new Date(event.date) < new Date() ? 'Completed' : 'Upcoming'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <Link href={`/event/${event._id || event.id}`} className="text-blue-600 hover:text-blue-900">
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaCalendar className="mx-auto text-gray-400 text-4xl mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No registered events</h3>
                  <p className="text-gray-500 mb-4">You haven't registered for any events yet.</p>
                  <Link 
                    href="/"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Browse Events
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Profile & Settings View */}
          {activeTab === 'settings' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile & Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                  <form>
                    <div className="mb-4">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        defaultValue={address ? `${address.substring(0, 10)}...` : ''}
                        readOnly
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="you@example.com"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="px-4 py-2 rounded-md font-medium text-gray-700 bg-gray-200 hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="ml-3 px-4 py-2 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Receive Notifications</p>
                        <p className="text-sm text-gray-500">Get alerts about upcoming events</p>
                      </div>
                      <button className="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none bg-blue-600">
                        <span className="sr-only">Toggle notification</span>
                        <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 translate-x-0"></span>
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email Updates</p>
                        <p className="text-sm text-gray-500">Get newsletters and promotions</p>
                      </div>
                      <button className="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none bg-blue-600">
                        <span className="sr-only">Toggle email updates</span>
                        <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 translate-x-0"></span>
                      </button>
                    </div>
                    
                    <div className="pt-4">
                      <h4 className="text-sm font-medium text-gray-900">Favorite Dance Styles</h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {['Bachata', 'Salsa', 'Kizomba', 'Merengue', 'Salsa&Bachata'].map((style) => (
                          <span key={style} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {style}
                          </span>
                        ))}
                      </div>
                    </div>
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