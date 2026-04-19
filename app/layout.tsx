import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Lofty Morning Handoff",
  description: "Your overnight AOS decisions, approval-ready.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
