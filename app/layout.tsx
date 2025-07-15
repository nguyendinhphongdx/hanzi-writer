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
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
