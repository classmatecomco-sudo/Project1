import { NextResponse } from 'next/server'

export const dynamic = 'force-static'

export async function GET() {
  const baseUrl = 'https://classmatecomco-sudo.github.io/Project1'
  const currentDate = new Date().toUTCString()

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>나눠줌 - 숙제 분배기</title>
    <link>${baseUrl}</link>
    <description>조별과제와 팀 프로젝트에서 공정하게 숙제를 분배하는 무료 도구</description>
    <language>ko-KR</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    
    <item>
      <title>조별과제 공정 분배 가이드: 갈등 없이 숙제 나누는 완벽한 방법</title>
      <link>${baseUrl}/guide</link>
      <description>조별과제나 팀 프로젝트에서 공정하게 업무를 분배하는 방법과 실전 팁을 알아보세요. 갈등 없이 효율적으로 협업하는 비결을 공개합니다.</description>
      <pubDate>${new Date('2026-01-25').toUTCString()}</pubDate>
      <guid>${baseUrl}/guide</guid>
    </item>
  </channel>
</rss>`

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  })
}
