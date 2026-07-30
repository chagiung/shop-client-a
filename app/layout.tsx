import './globals.css'
import { Inter } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: '오늘의 핫딜 꿀템',
  description: '매일매일 업데이트되는 가성비 추천템!',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        {children}
        {/* 고객 A의 GA4 측정 ID가 있다면 아래에 입력 (예: G-1234567) */}
        <GoogleAnalytics gaId="G-여기에고객A아이디입력" />
      </body>
    </html>
  )
}