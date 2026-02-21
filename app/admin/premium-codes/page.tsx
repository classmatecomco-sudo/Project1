'use client'

/* eslint react-hooks/set-state-in-effect: "off" */

import { useEffect, useState } from 'react'

interface Code {
  id: string
  code: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? ''
const codeGenUrl = () => (API_BASE ? `${API_BASE}/admin/premium-codes?count=1` : '/api/admin/premium-codes?count=1')

export default function PremiumCodesPage() {
  const [codes, setCodes] = useState<Code[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const generateCodes = async () => {
    setLoading(true)
    setError(null)
    try {
      setCopied(false)
      // next.config.ts에 output: 'export'가 있어 Next API 라우트는 동작하지 않음
      // 따라서 백엔드(4000)로만 호출, 항상 1개 생성
      const response = await fetch(codeGenUrl())

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      setCodes(data.codes || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : '코드 생성 중 오류가 발생했습니다.'
      if (message.includes('Failed to fetch') || message.includes('fetch')) {
        const isLocal = typeof window !== 'undefined' && /localhost|127\.0\.0\.1/.test(window.location.hostname)
        setError(
          isLocal
            ? '백엔드 서버에 연결할 수 없습니다. 터미널에서 "npm run server"를 실행해주세요.'
            : '백엔드에 연결할 수 없습니다. Vercel 배포라면 Railway 등에 백엔드를 배포한 뒤, Vercel 환경 변수에 NEXT_PUBLIC_API_BASE를 설정하고 재배포해주세요. (docs/VERCEL-BACKEND-DEPLOY.md 참고)'
        )
      } else {
        setError(message)
      }
      setCodes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // 페이지 진입 시 자동으로 코드 1개 생성
    void generateCodes()
  }, [])

  const singleCode = codes[0]?.code ?? ''

  const handleCopy = async () => {
    if (!singleCode) return
    try {
      await navigator.clipboard.writeText(singleCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>프리미엄 코드</h1>

      <div
        style={{
          marginBottom: '1.5rem',
          padding: '2rem 1rem',
          backgroundColor: '#0f172a',
          borderRadius: '12px',
          textAlign: 'center',
          color: '#e5e7eb',
          boxShadow: '0 10px 25px rgba(15,23,42,0.4)',
        }}
      >
        {singleCode ? (
          <>
            <div
              style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                letterSpacing: '0.3em',
                marginBottom: '1rem',
              }}
            >
              {singleCode}
            </div>
            <button
              onClick={handleCopy}
              style={{
                padding: '0.5rem 1.5rem',
                fontSize: '1rem',
                backgroundColor: '#22c55e',
                color: 'white',
                border: 'none',
                borderRadius: '999px',
                cursor: 'pointer',
              }}
            >
              {copied ? '복사됨!' : '코드 복사하기'}
            </button>
          </>
        ) : (
          <div style={{ fontSize: '1rem' }}>
            {loading ? '코드 생성 중...' : '코드를 불러오지 못했습니다. 다시 시도해주세요.'}
          </div>
        )}
      </div>

      {error && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            marginBottom: '1rem',
            color: '#c00',
          }}
        >
          오류: {error}
        </div>
      )}
    </div>
  )
}
