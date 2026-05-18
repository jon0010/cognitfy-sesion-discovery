import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { COGNITFY_LOGO_PATH } from '@/lib/site-branding'
import './globals.css'

const geistSans = Geist({ 
  subsets: ["latin"],
  variable: "--font-geist-sans"
});

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: "--font-geist-mono"
});

export const metadata: Metadata = {
  title: 'Cognitfy | Automatización inteligente para empresas',
  description:
    'Cognitfy ejecuta tareas repetitivas de principio a fin: llamadas, incidencias, facturación, pedidos, correos y más. Operación 24/7, integrada con las herramientas que el cliente ya usa.',
  generator: 'v0.app',
  icons: {
    icon: [{ url: COGNITFY_LOGO_PATH, type: 'image/png', sizes: 'any' }],
    apple: COGNITFY_LOGO_PATH,
    shortcut: COGNITFY_LOGO_PATH,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="bg-background">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
