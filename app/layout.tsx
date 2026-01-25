import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: '나눠줌 - 숙제 분배기',
  description: '조별과제와 팀 프로젝트에서 공정하게 숙제를 분배하는 무료 도구. 갈등 없이 효율적으로 협업하세요.',
  keywords: '숙제 분배, 조별과제, 팀 프로젝트, 공정 분배, 과제 관리, 협업 도구',
  generator: 'v0.app',
  openGraph: {
    title: '나눠줌 - 숙제 분배기',
    description: '조별과제와 팀 프로젝트에서 공정하게 숙제를 분배하는 무료 도구',
    type: 'website',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <head>
        <meta name="google-site-verification" content="sHNywcKkMw-BmZEqQ8r7fXYO62y-0mZohYydozrhvQw" />
        <meta name="google-adsense-account" content="ca-pub-8123007670953472" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8123007670953472"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}

