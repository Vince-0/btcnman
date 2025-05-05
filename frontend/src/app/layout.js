import './globals.css'

// Metadata must be in a server component
export const metadata = {
  title: 'Bitcoin Node Manager',
  description: 'Modern implementation of Bitcoin Node Manager',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  )
}
