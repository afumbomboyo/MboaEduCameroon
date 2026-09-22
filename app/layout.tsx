import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'MboaEdu: Cameroon Common Entrance & FSLC Quest',
  description:
    'Gamified primary school learning and examination preparation platform for Cameroon Common Entrance and FSLC, featuring an interactive Cameroon mission map, AI tutor diagnostics, Explain My Mistake engine, and parent/teacher dashboards.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#0f172a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen w-full overflow-x-hidden bg-slate-900 text-slate-100 antialiased font-sans selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
