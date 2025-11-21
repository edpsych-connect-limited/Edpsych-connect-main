import './globals.css';
import { Metadata, Viewport } from 'next';
import ClientLayout from './ClientLayout';

export const viewport: Viewport = {
  themeColor: '#2a5298',
};

export const metadata: Metadata = {
  title: 'EdPsych Connect World',
  description: 'A platform to connect and collaborate for educational psychologists.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="content-security-policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.vercel-insights.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self' data:; connect-src 'self' https://vercel.live https://*.vercel.app https://*.edpsychconnect.com https://*.edpsychconnect.app;"
        />
      </head>
      <ClientLayout>{children}</ClientLayout>
    </html>
  );
}
