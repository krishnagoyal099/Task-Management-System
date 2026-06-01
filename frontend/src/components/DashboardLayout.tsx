'use client';

import Sidebar from './Sidebar';
import { Search } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f4f6f8] flex">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        {/* Top Header / Search */}
        <header className="h-20 flex items-center px-8 border-b border-transparent">
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search Task"
              disabled
              className="w-full bg-white rounded-full py-3 pl-12 pr-4 text-sm outline-none border border-gray-100 shadow-sm placeholder:text-gray-400 cursor-not-allowed opacity-70"
            />
          </div>
        </header>
        <main className="p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
