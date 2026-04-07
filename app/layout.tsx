import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'SimplyGersi Dashboard',
  description: 'Live business dashboard — deals, revenue, tasks, content pipeline',
  themeColor: '#0f0f17',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-[#0f0f17] text-slate-200 antialiased`}>
        {children}
      </body>
    </html>
  );
}
