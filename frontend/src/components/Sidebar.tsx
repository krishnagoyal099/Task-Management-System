'use client';

import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckSquare, Home, LayoutGrid, User, Settings, LogOut } from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const navLinks = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/tasks', label: 'Board', icon: LayoutGrid },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-[#f8fafc] border-r border-gray-100 flex flex-col pt-8 pb-4">
      <div className="px-8 mb-10 flex items-center gap-3">
        <div className="bg-gray-900 rounded-lg p-1.5 flex items-center justify-center">
          <CheckSquare className="w-5 h-5 text-yellow-500" strokeWidth={2.5} />
        </div>
        <span className="text-2xl font-bold text-gray-900 tracking-tight">Taskboard</span>
      </div>

      <div className="px-4 flex-1">
        <p className="px-4 text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Menu</p>
        <nav className="space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-medium transition-all ${
                  isActive
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} strokeWidth={isActive ? 2.5 : 2} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <p className="px-4 text-sm font-semibold text-gray-400 mb-4 mt-8 uppercase tracking-wider">Account</p>
        <nav className="space-y-1">
          <div className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-500">
            <User className="w-5 h-5 text-gray-400" />
            <div className="flex flex-col">
              <span className="text-gray-900">{user.name}</span>
              <span className="text-sm text-gray-400">{user.role}</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all text-left"
          >
            <LogOut className="w-5 h-5 text-gray-400" />
            Sign Out
          </button>
        </nav>
      </div>
    </aside>
  );
}
