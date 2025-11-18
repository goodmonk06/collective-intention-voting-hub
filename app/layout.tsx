import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Collective Intention Voting Hub',
  description: 'Community-driven intention and theme voting platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        {children}
      </body>
    </html>
  );
}
