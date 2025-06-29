import type { Metadata } from 'next';
import './globals.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Toaster } from '@/components/ui/toaster';
import { AppProvider } from '@/context/AppContext';
import MainLayout from '@/components/layout/main-layout';

export const metadata: Metadata = {
  title: 'KemonoGestor',
  description: 'Advanced Fleet Management System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <AppProvider>
          <MainLayout>{children}</MainLayout>
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
