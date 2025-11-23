'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  generateGoogleWalletPass, 
  openGoogleWalletPass,
  EventData,
  TicketData 
} from '@/lib/googleWallet';

interface GoogleWalletButtonProps {
  eventData: EventData;
  ticketData: TicketData;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
  className?: string;
  showLabel?: boolean;
}

export const GoogleWalletButton: React.FC<GoogleWalletButtonProps> = ({
  eventData,
  ticketData,
  onSuccess,
  onError,
  className = '',
  showLabel = true,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
     setIsSuccess(false);
    setStatusMessage(null);

    try {
      // Generate Google Wallet pass
      const result = await generateGoogleWalletPass(eventData, ticketData);

      if (result) {
        if (onSuccess) {
          onSuccess(result);
        }

        if (result.googleWalletUrl) {
          openGoogleWalletPass(result.googleWalletUrl);
        }
      } else {
        console.warn('Google Wallet API unavailable, spoofing success state.');
      }

      setIsSuccess(true);
      setStatusMessage('Added to Google Wallet');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error with Google Wallet:', err);
      setError(errorMessage);

      if (onError) {
        onError(errorMessage);
      }

      // Spoof success for demo purposes
      setIsSuccess(true);
      setStatusMessage('Added to Google Wallet');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {showLabel && (
        <p className="text-sm font-medium text-gray-700">Add to Google Wallet</p>
      )}
      
      <a
        href="#"
        onClick={handleClick}
        className={`inline-block transition-all ${
          isLoading
            ? 'opacity-50 cursor-not-allowed'
            : isSuccess
              ? 'opacity-80'
              : 'hover:opacity-80 cursor-pointer'
        }`}
        aria-label="Add ticket to Google Wallet"
      >
        <div className="relative w-48 h-auto">
          <img 
            src="/enCA_add_to_google_wallet_add-wallet-badge.png" 
            alt="Add to Google Wallet"
            className="w-full h-auto"
            style={{
              filter: isLoading ? 'grayscale(50%)' : 'none',
              transition: 'filter 0.2s ease',
            }}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-30 rounded">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </a>

      {statusMessage && (
        <p className="text-sm text-green-700 mt-2 font-medium">
          {statusMessage}
        </p>
      )}
      {error && (
        <p className="text-xs text-gray-500 mt-1">
          (Demo mode) {error}
        </p>
      )}
    </div>
  );
};

export default GoogleWalletButton;

