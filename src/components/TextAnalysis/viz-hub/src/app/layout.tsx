import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Titillium_Web } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '../store/themeStore'
import Footer from '../components/layout/Footer'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

const titilliumWeb = Titillium_Web({
  weight: ['400', '700'],
  variable: '--font-titillium-web',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'ClioX - Text Analysis Visualization Hub',
  description: 'Interactive visualizations of text analysis results by ClioX',
  icons: {
    icon: [
      { url: '/cliox.svg', media: '(prefers-color-scheme: light)' },
      { url: '/cliox_dark_mode.svg', media: '(prefers-color-scheme: dark)' }
    ],
    shortcut: '/cliox.svg'
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-gray-50 dark:bg-gray-900">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${titilliumWeb.variable} antialiased min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900`}
      >
        <ThemeProvider>
          <div className="flex-grow">{children}</div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
