import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ModalProvider } from '@/context/ModalProvider'
import { Providers } from './providers'
import ThemeSwitch from '@/components/ThemeSwitch'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL("https://omeglerr.com/"),
  title: 'Omeglerr - Connecting lives, Connecting minds beyond borders',
  description: 'Omeglerr connects people worldwide through video chat. Enjoy random video calling with strangers, Chat with strangers, and experience the joy of meeting new people online. Free and easy to use!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="google-adsense-account" content="ca-pub-7951236970634483"/>
        {/* { process.env.NODE_ENV === 'production' && <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7951236970634483" crossOrigin="anonymous"></script>} */}
     
      </head>
      <body className={inter.className}>
      <Providers>
          <ModalProvider />
          <ThemeSwitch /> {/* Include ThemeSwitch component here */}
          {children}
        </Providers>
      </body>
    </html>
  )
}
