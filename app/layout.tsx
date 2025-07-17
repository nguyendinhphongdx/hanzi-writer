import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Learn Chinese Characters - 学习汉字",
  description:
    "Interactive web application to learn Chinese characters from Vietnamese and English words with pinyin, meanings, and stroke order guidance.",
  keywords: "Chinese characters, learn Chinese, pinyin, stroke order, Vietnamese to Chinese, English to Chinese",
  generator: 'v0.dev',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#3B82F6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HanziWriter'
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="smooth-scroll">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#3B82F6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="HanziWriter" />
        <meta name="format-detection" content="telephone=no, email=no, address=no" />
      </head>
      <body className={`${inter.className} touch-manipulation`}>{children}</body>
    </html>
  )
}
