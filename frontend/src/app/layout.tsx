import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { ToastProvider } from '@/components/Toast';

import { Petrona } from 'next/font/google';

const petrona = Petrona({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Task Management System',
  description: 'A production-quality task management application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={petrona.className}>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}