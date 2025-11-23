"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface RegistrationDocument {
  _id: string;
  nftTokenId?: string;
  metadataCid?: string;
  metadataUri?: string;
  imageCid?: string;
  transactionId?: string;
  userWallet?: string;
  [key: string]: any;
}

export default function ConfirmationPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const registrationId = searchParams?.get("registrationId");

  const [event, setEvent] = useState<any>(null);
  const [registration, setRegistration] = useState<RegistrationDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventResponse = await fetch(`/api/events?id=${id}`);
        if (!eventResponse.ok) {
          throw new Error("Failed to load event details");
        }
        const eventData = await eventResponse.json();
        setEvent(eventData);

        if (registrationId) {
          const registrationRes = await fetch(`/api/register?registrationId=${registrationId}`);
          if (!registrationRes.ok) {
            throw new Error("Failed to load ticket info");
          }
          const registrationData = await registrationRes.json();
          setRegistration(registrationData.registration);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, registrationId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl">Loading confirmation...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl text-red-500">{error || "Event not found"}</div>
      </div>
    );
  }

  const eventDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-xl w-full text-center space-y-6">
        <div className="mx-auto flex justify-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registration Confirmed!</h1>
          <p className="text-gray-600">You're all set for the event. Keep your NFT ticket handy.</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 text-left">
          <h2 className="font-semibold text-lg text-gray-900 mb-2">{event.title}</h2>
          <p className="text-gray-700 text-sm mb-1">{eventDate} at {event.time}</p>
          <p className="text-gray-700 text-sm">{event.venue}, {event.location}</p>
        </div>

        {registration && (
          <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2">
            <h3 className="font-semibold text-lg text-gray-900">NFT Ticket Details</h3>
            <p className="text-sm text-gray-800">
              <span className="font-medium">Token ID:</span> {registration.nftTokenId || "Pending"}
            </p>
            {registration.metadataUri && (
              <p className="text-sm">
                <span className="font-medium text-gray-800">Metadata:</span>{" "}
                <a
                  href={registration.metadataUri.replace("ipfs://", "https://dweb.link/ipfs/")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View JSON
                </a>
              </p>
            )}
            {registration.transactionId && (
              <p className="text-sm">
                <span className="font-medium text-gray-800">Transaction:</span>{" "}
                <a
                  href={`https://blockchair.com/bitcoin-cash/transaction/${registration.transactionId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  {registration.transactionId.slice(0, 12)}...
                </a>
              </p>
            )}
            {registration.userWallet && (
              <p className="text-sm text-gray-800">
                <span className="font-medium">Sent to:</span> {registration.userWallet}
              </p>
            )}
          </div>
        )}

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
