import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'apparel-sim — 次世代3Dスポーツウェア製造',
  description:
    'ブラウザ上でリアルタイム3D編集。デザイン確定で工場入稿データ（型紙・プリント・仕様書）を自動生成。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;700&family=Noto+Sans+JP:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#050505] text-white antialiased">{children}</body>
    </html>
  )
}
