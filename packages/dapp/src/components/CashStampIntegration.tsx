import { QRCodeSVG } from 'qrcode.react';
import { FaStamp, FaWallet } from 'react-icons/fa';

interface CashStampProps {
  address: string;
  amount?: number;
  message?: string;
}

interface SeleneWalletProps {
  eventId: string;
  eventName: string;
  dancerName: string;
}

export const CashStampQR = ({ address, amount, message }: CashStampProps) => {
  // Create a CashStamp URL - this is a simplified representation
  // In a real implementation, this would follow CashStamp URI format
  const cashstampUrl = `cashstamp:${address}?amount=${amount || 'any'}&message=${encodeURIComponent(message || 'BCH cashback')}`;
  
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-4 rounded-lg">
        <QRCodeSVG 
          value={cashstampUrl} 
          size={180} 
          bgColor="#ffffff" 
          fgColor="#000000" 
          level="H"
        />
      </div>
      <div className="mt-2 flex items-center text-sm">
        <FaStamp className="mr-2 text-green-600" />
        <span className="text-gray-700">CashStamp</span>
      </div>
    </div>
  );
};

export const SeleneWalletQR = ({ eventId, eventName, dancerName }: SeleneWalletProps) => {
  // Create a deep link for Selene Wallet
  // This is a simplified representation - actual implementation would depend on Selene Wallet's API
  const seleneUrl = `selene://ticket?eventId=${encodeURIComponent(eventId)}&eventName=${encodeURIComponent(eventName)}&dancer=${encodeURIComponent(dancerName)}`;
  
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-4 rounded-lg">
        <QRCodeSVG 
          value={seleneUrl} 
          size={180} 
          bgColor="#ffffff" 
          fgColor="#000000" 
          level="H"
        />
      </div>
      <div className="mt-2 flex items-center text-sm">
        <FaWallet className="mr-2 text-blue-600" />
        <span className="text-gray-700">Selene Wallet</span>
      </div>
    </div>
  );
};