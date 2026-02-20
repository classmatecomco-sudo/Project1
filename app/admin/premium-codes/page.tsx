'use client'

import { useState } from 'react'

interface Code {
  id: string
  code: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'

export default function PremiumCodesPage() {
  const [count, setCount] = useState(1)
  const [codes, setCodes] = useState<Code[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateCodes = async () => {
    setLoading(true)
    setError(null)
    try {
      // next.config.ts에 output: 'export'가 있어 Next API 라우트는 동작하지 않음
      // 따라서 백엔드(4000)로만 호출
      const response = await fetch(`${API_BASE}/admin/premium-codes?count=${count}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      setCodes(data.codes || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : '코드 생성 중 오류가 발생했습니다.'
      if (message.includes('Failed to fetch') || message.includes('fetch')) {
        setError('백엔드 서버에 연결할 수 없습니다. 터미널에서 "npm run server"를 실행했는지 확인해주세요.')
      } else {
        setError(message)
      }
      setCodes([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>프리미엄 코드 생성</h1>
      
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
          생성할 코드 개수:
        </label>
        <input
          type="number"
          min="1"
          max="1000"
          value={count}
          onChange={(e) => setCount(Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)))}
          style={{
            padding: '0.5rem',
            fontSize: '1rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            width: '200px',
          }}
        />
        <button
          onClick={generateCodes}
          disabled={loading}
          style={{
            marginLeft: '1rem',
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            backgroundColor: loading ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '생성 중...' : '코드 생성'}
        </button>
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

      {codes.length > 0 && (
        <div>
          <h2>생성된 코드 ({codes.length}개)</h2>
          <div
            style={{
              backgroundColor: '#f5f5f5',
              padding: '1rem',
              borderRadius: '4px',
              fontFamily: 'monospace',
            }}
          >
            {codes.map((item, index) => (
              <div
                key={item.id}
                style={{
                  padding: '0.5rem',
                  marginBottom: '0.5rem',
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              >
                <strong>{index + 1}.</strong> {item.code}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666', padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
        <p style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#0369a1' }}>
          ⚠️ 백엔드 서버 실행 필요
        </p>
        <p style={{ marginBottom: '0.5rem' }}>
          코드 생성을 사용하려면 백엔드 서버가 실행 중이어야 합니다.
        </p>
        <p style={{ marginBottom: '0.5rem' }}>
          <strong>별도 터미널에서 실행:</strong>
        </p>
        <code style={{ display: 'block', padding: '0.75rem', backgroundColor: '#1e293b', color: '#f1f5f9', borderRadius: '4px', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
          npm run server
        </code>
        <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
          서버가 실행되면 <code style={{ backgroundColor: '#e2e8f0', padding: '0.2rem 0.4rem', borderRadius: '3px' }}>http://localhost:4000</code>에서 응답합니다.
        </p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
          생성된 코드는 <code style={{ backgroundColor: '#e2e8f0', padding: '0.2rem 0.4rem', borderRadius: '3px' }}>backend/data.json</code> 파일에 저장됩니다.
        </p>
      </div>
    </div>
  )
}
