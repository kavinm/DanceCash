"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { FaCalendar, FaClock, FaMapMarkerAlt, FaDollarSign } from "react-icons/fa";
import Link from "next/link";
import { useWeb3ModalConnectorContext } from "@bch-wc2/web3modal-connector";
import { BaseWallet } from "mainnet-js";
import { createEventTicketToken, sendEventTicketToken, createCashBackToken } from "@/lib/ticketTokens";
import { EventTicketData } from "@/utils";
import { CashStampQR, SeleneWalletQR } from "@/components/CashStampIntegration";

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
    instructor: "Maria Rodriguez"
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
    instructor: "James Wilson"
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
    instructor: "Carlos Mendez & Sofia Lopez"
  }
];

export default function RegistrationPage() {
  const { id } = useParams();
  const router = useRouter();
  const { address, connector } = useWeb3ModalConnectorContext();
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

  const event = mockEvents.find(e => e.id === id);

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

  const handleBCHPayment = async () => {
    if (!address || !connector) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      setBchPaymentStatus('processing');

      // Calculate the amount with 10% discount
      const amount = paymentMethod === 'bch' ? event.price * 0.9 : event.price;

      // In a real app, we would send the payment to an event organizer's address
      // For this demo, we'll just simulate the payment
      console.log(`Processing BCH payment of ${amount} BCH for event ${event.id}`);

      // Simulate payment processing
      setTimeout(() => {
        setBchPaymentStatus('completed');
        setStep(3);
      }, 2000);
    } catch (error) {
      console.error('BCH payment error:', error);
      setBchPaymentStatus('failed');
      alert('Payment failed. Please try again.');
    }
  };

  const handleFiatPayment = () => {
    // In a real app, this would integrate with Google Pay/Apple Pay
    console.log('Processing fiat payment via Google/Apple Pay');
    setStep(3);
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'bch') {
      handleBCHPayment();
    } else {
      handleFiatPayment();
    }
  };

  const generateTicket = async () => {
    if (!address || !connector) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      // Create a wallet instance from the connected address
      const wallet = await BaseWallet.watchOnly(address);

      // Prepare event ticket data
      const ticketInfo: EventTicketData = {
        eventId: event.id,
        eventName: event.title,
        eventDate: event.date,
        venue: event.venue,
        dancerName: formData.name,
        dancerEmail: formData.email
      };

      // Create the event ticket token (NFT)
      const ticketResult = await createEventTicketToken(wallet, ticketInfo);

      // Send the ticket token to the dancer's wallet address
      const ticketSendResult = await sendEventTicketToken(
        wallet,
        ticketResult.tokenId,
        ticketResult.commitment,
        address
      );

      // Calculate cashback amount in satoshis (10% of ticket price in USD, converted to BCH then to satoshis)
      // For demo purposes, we'll use a fixed conversion: $1 = 1000 satoshis
      const ticketPriceInUSD = paymentMethod === 'bch' ? event.price * 0.9 : event.price;
      const cashbackAmount = Math.floor(ticketPriceInUSD * 0.1 * 1000); // Using $1 = 1000 sat conversion for demo

      // Create the cashback token
      const cashbackResult = await createCashBackToken(
        wallet,
        cashbackAmount,
        address,
        event.id
      );

      setTicketData({
        ticket: {
          ...ticketResult,
          txId: ticketSendResult
        },
        cashback: cashbackResult
      });

      console.log('Ticket and cashback generated successfully:', { ticket: ticketResult, cashback: cashbackResult });
      return true;
    } catch (error) {
      console.error('Error generating ticket:', error);
      alert('Failed to generate ticket. Please try again.');
      return false;
    }
  };

  const handleConfirm = async () => {
    // Generate the NFT ticket and cashback token
    const ticketGenerated = await generateTicket();
    if (ticketGenerated) {
      router.push(`/confirmation/${id}`);
    }
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
                      <p className="text-gray-700">{event.danceStyle} • {event.venue}, {event.location}</p>
                      <div className="flex items-center text-sm text-gray-600 mt-2">
                        <FaCalendar className="mr-2" /> {eventDate} • {event.time}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">${event.price}</div>
                      {paymentMethod === 'bch' && (
                        <div className="text-sm text-gray-600">with 10% BCH discount: ${(event.price * 0.9).toFixed(2)}</div>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      <div className="text-sm text-gray-500">Get a 10% discount: ${(event.price * 0.9).toFixed(2)}</div>
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
                      <div className="text-sm text-gray-500">Regular price: ${event.price.toFixed(2)}</div>
                    </div>
                  </label>
                </div>

                <form onSubmit={handlePayment}>
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="flex justify-between mb-2">
                      <span>Event Price:</span>
                      <span>${event.price.toFixed(2)}</span>
                    </div>
                    {paymentMethod === 'bch' && (
                      <div className="flex justify-between mb-2">
                        <span>BCH Discount (10%):</span>
                        <span className="text-green-600">-${(event.price * 0.1).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{paymentMethod === 'bch' ? `$${(event.price * 0.9).toFixed(2)}` : `$${event.price.toFixed(2)}`}</span>
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
                        <button
                          type="button"
                          onClick={handleFiatPayment}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md font-medium"
                        >
                          Pay with Google Pay / Apple Pay
                        </button>
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
                    {paymentMethod === 'fiat' && (
                      <button
                        type="submit"
                        className="px-6 py-3 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Complete Registration
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Registration Complete!</h2>

                <div className="text-center py-8">
                  <div className="inline-block bg-green-100 text-green-800 rounded-full p-4 mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">You're Registered for {event.title}!</h3>
                  <p className="text-gray-700 mb-6">We've sent a confirmation to {formData.email}</p>

                  <div className="bg-gray-50 p-6 rounded-lg mb-6 text-left max-w-md mx-auto">
                    <h4 className="font-semibold mb-3">Your Event Ticket (NFT)</h4>
                    <div className="flex flex-col items-center mb-4">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-48 h-48 flex items-center justify-center mb-3">
                        NFT Ticket Preview
                      </div>
                      <p className="text-sm text-gray-600">Your ticket is stored as an NFT CashToken</p>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Event:</span>
                        <span className="font-medium">{event.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">{eventDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-medium">{event.time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Venue:</span>
                        <span className="font-medium">{event.venue}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold mb-3">Get Your NFT Ticket</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                      <div className="border border-gray-200 p-4 rounded-lg">
                        <h5 className="font-medium mb-2">Selene Wallet</h5>
                        <p className="text-sm text-gray-600 mb-3">Download to receive and manage your NFT ticket</p>
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm">
                          Download Selene Wallet
                        </button>
                        <div className="mt-3 flex justify-center">
                          <SeleneWalletQR
                            eventId={event.id}
                            eventName={event.title}
                            dancerName={formData.name}
                          />
                        </div>
                      </div>

                      <div className="border border-gray-200 p-4 rounded-lg">
                        <h5 className="font-medium mb-2">CashStamp</h5>
                        <p className="text-sm text-gray-600 mb-3">Scan to receive BCH cashback for next event</p>
                        <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm">
                          Open CashStamp
                        </button>
                        <div className="mt-3 flex justify-center">
                          <CashStampQR
                            address={address || 'temp_address'}
                            amount={event.price * 0.1} // 10% cashback
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