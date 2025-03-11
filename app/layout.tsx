import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/toaster"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Note Wise",
  description: "A modern note-taking application",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}

