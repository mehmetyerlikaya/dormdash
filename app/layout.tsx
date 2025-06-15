import type React from "react"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bgLight text-gray-800 font-sans">
        <nav className="bg-white shadow-sm p-4 border-b border-gray-200">
          <div className="container mx-auto">
            <h1 className="text-xl font-bold text-primary">🏠 Dorm Dashboard</h1>
          </div>
        </nav>
        <main className="container mx-auto py-8">{children}</main>
        <footer className="text-center text-sm text-gray-500 py-4 border-t border-gray-200 bg-white">dorm21</footer>
      </body>
    </html>
  )
}


import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
