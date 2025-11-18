"use client";
import Link from 'next/link';
import { Plus } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-[#1a1d2e] border-b border-gray-800 px-6 py-4 flex items-center justify-between flex-shrink-0">
      <div className="flex-1 max-w-xl">
       
      </div>
      
      <div className="flex items-center gap-4 ml-6">
        <Link href='/notes/new'>
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Note
          </button>
        </Link>
      </div>
    </header>
  );
};

export default Header;