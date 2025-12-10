import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Contexto Tiếng Việt - Vietnamese Contexto | @minhqnd',
  description: 'Đoán từ trong tiếng Việt với Contexto. Chơi ngay để thử thách khả năng từ vựng của bạn!',
  keywords: ['Contexto', 'Vietnamese', 'game', 'vietnamese contexto', 'contexto vietnamese', 'vietnamese contexto game', 'contexto tiếng việt', 'trò chơi đoán từ tiếng việt', 'trò chơi đoán từ', 'trò chơi đoán từ tiếng việt online', 'trò chơi đoán từ tiếng việt miễn phí', 'đoán từ', 'đoán từ tiếng việt'],
  metadataBase: new URL('https://minhqnd.com'),
  alternates: {
    canonical: '/contexto',
  },
  openGraph: {
    title: 'Contexto Tiếng Việt - Vietnamese Contexto | @minhqnd',
    description: 'Đoán từ trong tiếng Việt với Contexto. Chơi ngay để thử thách khả năng từ vựng của bạn!',
    locale: 'vi_VN',
    url: 'https://minhqnd.com/contexto',
    siteName: 'Contexto Tiếng Việt - Vietnamese Contexto | @minhqnd',
    type: 'website',
    images: [
      {
        url: '/img/contexto_vi_1200x630.png',
        width: 1200,
        height: 630,
        alt: 'Contexto Tiếng Việt - Vietnamese Contexto',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contexto Tiếng Việt - Vietnamese Contexto | @minhqnd',
    description: 'Đoán từ trong tiếng Việt với Contexto. Chơi ngay để thử thách khả năng từ vựng của bạn!',
    site: '@minhqnd',
    creator: '@minhqnd',
    images: ['/img/contexto_vi_1200x630.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className='bg-orange-50 dark:bg-neutral-900'>{children}</body>
    </html>
  )
}
