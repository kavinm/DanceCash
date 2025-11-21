import Link from "next/link";
import ConnectButton from "./ConnectButton";

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          💃 Dance.cash
        </Link>
        <nav className="hidden md:flex space-x-8">
          <Link href="/" className="text-gray-700 hover:text-blue-600">
            Events
          </Link>
          <Link href="/studios" className="text-gray-700 hover:text-blue-600">
            Studios
          </Link>
          <Link href="/dancers" className="text-gray-700 hover:text-blue-600">
            Dancers
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}