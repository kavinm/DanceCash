"use client";

import ConnectButton from "@/components/ConnectButton";
import FinishTransactionModal from "@/components/FinishTransactionModal";
import { IConnector, WcSignTransactionRequest } from "@bch-wc2/interfaces";
import { useWeb3ModalConnectorContext } from "@bch-wc2/web3modal-connector";
import { decodeTransaction, hexToBin } from "@bitauth/libauth";
import { useCallback, useMemo, useState, useEffect } from "react";
import { FaCalendar, FaClock, FaMapMarkerAlt, FaDollarSign } from "react-icons/fa";
import Header from "@/components/Header";
import Link from "next/link";

export default function Home() {
  const { connector, address } = useWeb3ModalConnectorContext();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events');
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const eventsData = await response.json();
        setEvents(eventsData.events || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const wrappedConnector = useMemo(() => connector ? {
    ...connector,
    signTransaction: async (options: WcSignTransactionRequest) => {
      // Handle transaction signing
      try {
        if (typeof options.transaction === "string") {
          options.transaction = decodeTransaction(hexToBin(options.transaction));
        }
        const result = await connector.signTransaction(options);
        return result;
      } catch (e: any) {
        console.error(e);
        throw e;
      }
    },
  } : undefined as IConnector | undefined, [connector]);

  const [showFinishTransactionModal, setShowFinishTransactionModal] = useState<boolean>(false);
  const [finishTransactionMessage, setFinishTransactionMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [info, setInfo] = useState<string>("");

  const showError = useCallback((message: string) => {
    setError(message);
    setTimeout(() => setError(""), 10000);
  }, []);

  const showInfo = useCallback((message: string) => {
    setInfo(message);
    setTimeout(() => setInfo(""), 10000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl">Loading events...</div>
      </div>
    );
  }

  return (
    <div>
      {showFinishTransactionModal && <FinishTransactionModal
        onClose={() => setShowFinishTransactionModal(false)}
        message={finishTransactionMessage}
        ></FinishTransactionModal>}
      {(error.length > 0 || info.length > 0) &&
        <div className={`fixed z-40 top-0 flex justify-center w-full py-3`}>
          {error.length > 0 && <div onClick={() => setError("")} className="break-all md:break-normal mx-3 mb-4 rounded-lg border-red-300 border-solid border-2 bg-red-100 px-6 py-5 text-base text-red-700" role="alert">{error}</div>}
          {info.length > 0 && <div onClick={() => setInfo("")} className="break-all md:break-normal mx-3 mb-4 rounded-lg border-green-300 border-solid border-2 bg-green-100 px-6 py-5 text-base text-green-700" role="alert">{info}</div>}
        </div>
      }
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Upcoming Dance Events</h1>
            <p className="text-gray-600">Find and book your next dance adventure</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const eventDate = event.date ? new Date(event.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'TBD';

              return (
                <div key={event._id || event.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="relative">
                    <img
                      src={event.image || "https://images.unsplash.com/photo-1542662565-7e4e66d9d8f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"}
                      alt={event.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {event.danceStyle || 'Dance'}
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
                        <span>{event.startTime || 'TBD'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <FaMapMarkerAlt className="mr-2 text-blue-500" />
                        <span>{event.venue || 'TBD'}, {event.location?.city ? `${event.location.city}, ${event.location.state}` : 'TBD'}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <FaDollarSign className="text-green-600 mr-1" />
                        <span className="font-bold text-lg">${event.price || 0}</span>
                        {(event.price || 0) > 0 && (
                          <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                            10% BCH discount
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/event/${event._id || event.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-300"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
