'use client'

import { useState } from 'react'

interface Code {
  id: string
  code: string
}

export default function PremiumCodesPage() {
  const [count, setCount] = useState(1)
  const [codes, setCodes] = useState<Code[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateCodes = async () => {
    setLoading(true)
    setError(null)
    try {
      // API 라우트가 작동하지 않을 경우를 대비해 백엔드 서버로도 시도
      let response
      try {
        // 먼저 Next.js API 라우트 시도
        response = await fetch(`/api/admin/premium-codes?count=${count}`)
      } catch (e) {
        // 실패하면 백엔드 서버(포트 4000)로 시도
        response = await fetch(`http://localhost:4000/admin/premium-codes?count=${count}`)
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      setCodes(data.codes || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '코드 생성 중 오류가 발생했습니다.')
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

      <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666' }}>
        <p>
          <strong>참고:</strong> 생성된 코드는 백엔드 서버의 <code>backend/data.json</code> 파일에 저장됩니다.
        </p>
        <p>
          API 엔드포인트가 작동하지 않을 경우, 백엔드 서버를 별도로 실행하세요:
        </p>
        <code style={{ display: 'block', padding: '0.5rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          npm run server
        </code>
      </div>
    </div>
  )
}
