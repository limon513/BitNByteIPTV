import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata: Metadata = {
  title: 'BitNByte TV — Free Live Sports & Channels',
  description: 'Watch free live sports, cricket, football, UFC, Bangladeshi TV channels and more.',
  /* icon.svg in src/app/ is auto-detected by Next.js App Router */
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full overflow-hidden`}>
      <body className="h-full overflow-hidden antialiased" style={{ background: '#050508' }}>
        {children}
      </body>
    </html>
  );
}
