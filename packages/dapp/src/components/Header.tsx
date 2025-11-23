import Link from "next/link";
import ConnectButton from "./ConnectButton";

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <img
            src="/DanceCash.jpeg"
            alt="Dance Cash"
            className="h-16 w-auto rounded-lg shadow-md"
          />
        </Link>
        <nav className="hidden md:flex space-x-8">
          <Link href="/" className="text-black hover:text-[#0AC18E]">
            Events
          </Link>
          <Link href="/studios" className="text-black hover:text-[#0AC18E]">
            Studios
          </Link>
          <Link href="/dancers" className="text-black hover:text-[#0AC18E]">
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