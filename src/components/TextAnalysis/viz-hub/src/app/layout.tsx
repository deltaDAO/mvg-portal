import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Titillium_Web } from 'next/font/google'
import './globals.css'

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
  title: 'Text Analysis Visualization Hub',
  description: 'Interactive visualizations of text analysis results by ClioX'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${titilliumWeb.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
