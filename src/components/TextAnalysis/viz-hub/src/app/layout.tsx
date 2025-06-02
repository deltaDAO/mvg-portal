import { Geist, Geist_Mono } from 'next/font/google'
import { Titillium_Web } from 'next/font/google'
import './globals.css'

const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist'
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-mono'
})

const titilliumWeb = Titillium_Web({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-titillium-web'
})

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} ${titilliumWeb.variable}`}
    >
      <head>
        <title>Text Analysis Visualization Hub</title>
        <meta
          name="description"
          content="Interactive analysis developed by ClioX"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
