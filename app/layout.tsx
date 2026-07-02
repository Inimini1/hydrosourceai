import type { Metadata, Viewport } from 'next'
import { Hanken_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import ConsentBanner from '@/components/ConsentBanner'
import { PostHogProvider } from '@/components/PostHogProvider'
import { ToastProvider } from '@/components/Toaster'

const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '600', '700'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '700'],
})

export const metadata: Metadata = {
  title: 'HydroSource — AI Pool Chemistry Analysis',
  description: 'AI-powered water chemistry analysis and treatment plans for pool professionals. Scan test strips, get instant dosing guidance, and track service history.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  keywords: ['pool chemistry', 'pool management', 'water testing', 'pool professional', 'AI pool analysis', 'test strip scanner'],
  openGraph: {
    title: 'HydroSource — AI Pool Chemistry Analysis',
    description: 'Scan test strips, get instant AI dosing guidance, and track service history. Built for pool professionals.',
    url: 'https://hydrosource.appscloud365.com',
    siteName: 'HydroSource',
    type: 'website',
    images: [
      {
        url: 'https://hydrosource.appscloud365.com/og.png',
        width: 1200,
        height: 630,
        alt: 'HydroSource — AI Pool Chemistry Analysis',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HydroSource — AI Pool Chemistry Analysis',
    description: 'Scan test strips, get instant AI dosing guidance, and track service history.',
    images: ['https://hydrosource.appscloud365.com/og.png'],
  },
  metadataBase: new URL('https://hydrosource.appscloud365.com'),
}

export const viewport: Viewport = {
  themeColor: '#00f2ff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${hankenGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased bg-white">
        <PostHogProvider>
          <ToastProvider>
            {children}
            <ConsentBanner />
          </ToastProvider>
        </PostHogProvider>
      </body>
    </html>
  )
}
