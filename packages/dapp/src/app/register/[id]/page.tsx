"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCalendar, FaClock, FaMapMarkerAlt, FaDollarSign } from "react-icons/fa";
import Link from "next/link";
import { useWeb3ModalConnectorContext } from "@bch-wc2/web3modal-connector";
import { mintEventTicketNFT } from "@/lib/ticketMinting";
import { EventTicketData, DEFAULT_TICKET_IMAGE } from "@/utils";
import { CashStampQR, SeleneWalletQR } from "@/components/CashStampIntegration";
import GoogleWalletButton from "@/components/GoogleWalletButton";
import { formatEventDataForWallet } from "@/lib/googleWallet";

export default function RegistrationPage() {
  const { id } = useParams();
  const router = useRouter();
  const { address } = useWeb3ModalConnectorContext();
  const [step, setStep] = useState(1); // 1: Info, 2: Payment, 3: Confirmation
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    saveInfo: false
  });
  const [paymentMethod, setPaymentMethod] = useState<'bch' | 'fiat'>('bch');
  const [bchPaymentStatus, setBchPaymentStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');
  const [ticketData, setTicketData] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMintingTicket, setIsMintingTicket] = useState(false);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.phone) {
      setStep(2);
    }
  };

  const mintTicketIfNeeded = async () => {
    if (ticketData) {
      return true;
    }

    if (isMintingTicket) {
      alert('Ticket is currently being minted. Please wait a moment.');
      return false;
    }

    setIsMintingTicket(true);
    try {
      const registrationId = await generateTicket();
      return Boolean(registrationId);
    } finally {
      setIsMintingTicket(false);
    }
  };

  const handleBCHPayment = async () => {
    if (!address) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      setBchPaymentStatus('processing');

      console.log(`Processing BCH payment for event ${event._id || id}`);

      const minted = await mintTicketIfNeeded();
      if (!minted) {
        throw new Error('Ticket minting failed');
      }

      setBchPaymentStatus('completed');
      setStep(3);
    } catch (error) {
      console.error('BCH payment error:', error);
      setBchPaymentStatus('failed');
      alert('Payment failed. Please try again.');
    }
  };

  const handleFiatPayment = async () => {
    if (!address) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      console.log('Processing fiat payment via Google/Apple Pay');

      const minted = await mintTicketIfNeeded();
      if (!minted) {
        throw new Error('Ticket minting failed');
      }

      setStep(3);
    } catch (error) {
      console.error('Fiat payment error:', error);
      alert('Payment failed. Please try again.');
    }
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'bch') {
      handleBCHPayment();
    } else {
      handleFiatPayment();
    }
  };

  const generateTicket = async (): Promise<string | null> => {
    if (!address) {
      alert("Please connect your wallet first");
      return null;
    }

    try {
      // Prepare event ticket data
      const ticketInfo: EventTicketData = {
        eventId: event._id || id,
        eventName: event.title,
        eventDate: event.date,
        venue: event.venue,
        dancerName: formData.name,
        dancerEmail: formData.email,
        dancerWallet: address,
        imageUrl: event.image || DEFAULT_TICKET_IMAGE,
      };

      // Calculate cashback amount (10% of ticket price)
      // Mint the event ticket NFT via issuer wallet
      const mintResult = await mintEventTicketNFT({
        ticket: ticketInfo,
      });

      // Create registration record in the database
      const registrationResponse = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event._id || id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          paymentMethod: paymentMethod,
          nftTokenId: mintResult.tokenId,
          transactionId: mintResult.txId,
          metadataCid: mintResult.metadataCid,
          metadataUri: mintResult.metadataUri,
          imageCid: mintResult.imageCid,
          userWallet: address,
        }),
      });

      if (!registrationResponse.ok) {
        throw new Error('Failed to create registration');
      }

      const registrationPayload = await registrationResponse.json();
      const registrationData = registrationPayload.registration;

      setTicketData({
        ticket: {
          ...mintResult,
        },
        registration: registrationData
      });

      console.log('Ticket generated successfully:', {
        ticket: mintResult,
        registration: registrationData
      });

      return registrationPayload.registrationId;
    } catch (error) {
      console.error('Error generating ticket:', error);
      alert('Failed to generate NFT ticket. Please try again.');
      return null;
    }
  };

  const handleConfirm = async () => {
    if (!ticketData) {
      console.warn('Ticket still minting, directing user to /dancers anyway.');
    }

    router.push('/dancers');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <Link href={`/event/${id}`} className="text-blue-600 hover:underline flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Event
          </Link>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Register for Event</h1>

            {/* Progress bar */}
            <div className="flex items-center mb-8">
              <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>1</div>
                <span>Information</span>
              </div>
              <div className="flex-1 h-0.5 bg-gray-300 mx-2"></div>
              <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>2</div>
                <span>Payment</span>
              </div>
              <div className="flex-1 h-0.5 bg-gray-300 mx-2"></div>
              <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>3</div>
                <span>Confirmation</span>
              </div>
            </div>

            {step === 1 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Information</h2>
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="flex items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      <p className="text-gray-700">{event.danceStyle || 'Dance Event'} • {event.venue || 'TBD'}, {event.location?.city ? `${event.location.city}, ${event.location.state}` : event.location || 'TBD'}</p>
                      <div className="flex items-center text-sm text-gray-600 mt-2">
                        <FaCalendar className="mr-2" /> {eventDate} • {event.startTime || 'TBD'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">${event.price || 0}</div>
                      {paymentMethod === 'bch' && (
                        <div className="text-sm text-gray-600">with 10% BCH discount: ${((event.price || 0) * 0.9).toFixed(2)}</div>
                      )}
                    </div>
                  </div>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Information</h2>
                <form onSubmit={handleNext}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="saveInfo"
                        checked={formData.saveInfo}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Save my information for faster checkouts in the future
                      </span>
                    </label>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!formData.name || !formData.email || !formData.phone}
                      className={`px-6 py-3 rounded-md font-medium text-white ${
                        !formData.name || !formData.email || !formData.phone
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      Continue to Payment
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>

                <div className="mb-6">
                  <label className="flex items-center mb-4">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'bch'}
                      onChange={() => setPaymentMethod('bch')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">Pay with Bitcoin Cash (BCH)</div>
                      <div className="text-sm text-gray-500">Get a 10% discount: ${((event.price || 0) * 0.9).toFixed(2)}</div>
                    </div>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'fiat'}
                      onChange={() => setPaymentMethod('fiat')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">Pay with Fiat (Google/Apple Pay)</div>
                      <div className="text-sm text-gray-500">Regular price: ${(event.price || 0).toFixed(2)}</div>
                    </div>
                  </label>
                </div>

                <form onSubmit={handlePayment}>
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="flex justify-between mb-2">
                      <span>Event Price:</span>
                      <span>${(event.price || 0).toFixed(2)}</span>
                    </div>
                    {paymentMethod === 'bch' && (
                      <div className="flex justify-between mb-2">
                        <span>BCH Discount (10%):</span>
                        <span className="text-green-600">-${((event.price || 0) * 0.1).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{paymentMethod === 'bch' ? `$${((event.price || 0) * 0.9).toFixed(2)}` : `$${(event.price || 0).toFixed(2)}`}</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    {paymentMethod === 'bch' ? (
                      <div className="border border-blue-200 bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Pay with Bitcoin Cash (BCH)</h3>
                        <p className="text-sm text-gray-700 mb-3">
                          {bchPaymentStatus === 'processing'
                            ? 'Processing your BCH payment...'
                            : 'Complete your registration by paying with Bitcoin Cash.'}
                        </p>

                        {bchPaymentStatus === 'processing' && (
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-3"></div>
                            <p>Processing payment...</p>
                          </div>
                        )}

                        {bchPaymentStatus !== 'processing' && (
                          <div className="flex justify-center">
                            <button
                              type="button"
                              onClick={handleBCHPayment}
                              disabled={!address}
                              className={`px-6 py-3 rounded-md font-medium text-white ${
                                !address
                                  ? 'bg-gray-400 cursor-not-allowed'
                                  : 'bg-blue-600 hover:bg-blue-700'
                              }`}
                            >
                              {address ? 'Complete BCH Payment' : 'Connect Wallet First'}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="border border-green-200 bg-green-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Pay with Fiat</h3>
                        <div className="flex flex-col gap-4">
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">Add to Google Wallet</p>
                            <a
                              href="#"
                              className="inline-block hover:opacity-80 transition-opacity"
                              onClick={(e) => {
                                e.preventDefault();
                                // Google Wallet will be implemented after payment
                              }}
                            >
                              <img 
                                src="/enCA_add_to_google_wallet_add-wallet-badge.png" 
                                alt="Add to Google Wallet"
                                className="h-auto"
                                style={{ width: '200px' }}
                              />
                            </a>
                          </div>
                          <button
                            type="button"
                            onClick={handleFiatPayment}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md font-medium"
                          >
                            Pay with Google Pay / Apple Pay
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-6 py-3 rounded-md font-medium text-gray-700 bg-gray-200 hover:bg-gray-300"
                    >
                      Back
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-xl font-semibold text-black mb-4">Registration Complete!</h2>

                <div className="text-center py-8">
                  <div className="inline-block bg-green-100 text-green-800 rounded-full p-4 mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>

                  <h3 className="text-2xl font-bold text-black mb-2">You're Registered for {event.title}!</h3>
                  <p className="text-black mb-6">We've sent a confirmation to {formData.email}</p>

                  <div className="bg-gray-50 p-6 rounded-lg mb-6 text-left max-w-md mx-auto">
                    <h4 className="font-semibold text-black mb-3">Your Event Ticket (NFT)</h4>
                    <div className="flex flex-col items-center mb-4">
                      <div className="bg-white border-2 border-gray-300 rounded-xl w-48 h-48 flex items-center justify-center mb-3 overflow-hidden">
                        <img src="/Dance.cash.png" alt="Event Ticket" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-sm text-black">Your ticket is stored as an NFT CashToken</p>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-black">Event:</span>
                        <span className="font-medium text-black">{event.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-black">Date:</span>
                        <span className="font-medium text-black">{eventDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-black">Time:</span>
                        <span className="font-medium text-black">{event.startTime || 'TBD'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-black">Venue:</span>
                        <span className="font-medium text-black">{event.venue || 'TBD'}</span>
                      </div>
                      {ticketData && ticketData.ticket && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-black">Token ID:</span>
                            <span className="font-medium text-xs break-all text-black">{ticketData.ticket.tokenId?.substring(0, 8)}...</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-black">Transaction:</span>
                            <span className="font-medium text-xs break-all text-black">{ticketData.ticket.txId?.substring(0, 8)}...</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold mb-3">Get Your NFT Ticket</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                      <div className="border border-blue-200 bg-blue-50 p-4 rounded-lg">
                        <h5 className="font-medium mb-2">Google Wallet</h5>
                        <p className="text-sm text-gray-600 mb-4">Add your ticket to Google Wallet</p>
                        {ticketData && ticketData.ticket ? (
                          <GoogleWalletButton
                            eventData={formatEventDataForWallet(event)}
                            ticketData={{
                              eventId: event._id || String(id),
                              eventName: event.title,
                              eventDate: event.date,
                              venue: event.venue || 'TBD',
                              dancerName: formData.name,
                              dancerEmail: formData.email,
                              dancerWallet: address || 'unknown',
                              imageUrl: event.image || DEFAULT_TICKET_IMAGE,
                              tokenId: ticketData.ticket.tokenId,
                              txId: ticketData.ticket.txId,
                              metadataCid: ticketData.ticket.metadataCid,
                              metadataUri: ticketData.ticket.metadataUri,
                              imageCid: ticketData.ticket.imageCid,
                            }}
                            onSuccess={(result) => {
                              console.log('Google Wallet pass created:', result);
                            }}
                            onError={(error) => {
                              console.error('Google Wallet error:', error);
                            }}
                            showLabel={false}
                            className="w-full"
                          />
                        ) : (
                          <button 
                            disabled 
                            className="w-full bg-gray-400 cursor-not-allowed text-white py-2 px-4 rounded-md text-sm"
                          >
                            Loading...
                          </button>
                        )}
                      </div>

                      <div className="border border-gray-200 p-4 rounded-lg">
                        <h5 className="font-medium mb-2">Selene Wallet</h5>
                        <p className="text-sm text-gray-600 mb-3">Download to receive and manage your NFT ticket</p>
                        <div className="flex justify-center mb-3">
                          <img
                            src="/selene.png"
                            alt="Selene Wallet"
                            className="w-32 h-auto object-contain"
                          />
                        </div>
                        <a
                          href="https://selene.cash/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm"
                        >
                          Download Selene Wallet
                        </a>
                        <div className="mt-3 flex justify-center">
                          <SeleneWalletQR
                            eventId={event._id || id}
                            eventName={event.title}
                            dancerName={formData.name}
                          />
                        </div>
                      </div>

                      <div className="border border-gray-200 p-4 rounded-lg">
                        <h5 className="font-medium mb-2">CashStamp</h5>
                        <p className="text-sm text-gray-600 mb-3">Scan to receive BCH cashback for next event</p>
                        <div className="flex justify-center mb-3">
                          <img
                            src="/stampsCash.svg"
                            alt="Stamps Cash"
                            className="w-32 h-auto object-contain"
                          />
                        </div>
                        <a
                          href="https://stamps.cash/#/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-center bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm"
                        >
                          Open CashStamp
                        </a>
                        <div className="mt-3 flex justify-center">
                          <CashStampQR
                            address={address || 'temp_address'}
                            amount={Math.floor(((event.price || 0) * 0.1) * 1000)} // 10% cashback in satoshis
                            message={`Cashback for ${event.title}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={handleConfirm}
                      className="px-6 py-3 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Finish & View My Tickets
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}