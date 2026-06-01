import { useState, useEffect } from 'react'

export default function Home() {
  const [env, setEnv] = useState<'production' | 'staging'>('production')

  useEffect(() => {
    const appEnv = (process.env.NEXT_PUBLIC_APP_ENV || 'production') as 'production' | 'staging'
    setEnv(appEnv)
  }, [])

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h1>🚀 Responsify HR</h1>
        <p style={{ fontSize: '0.95rem', color: '#666' }}>
          {env === 'production' 
            ? '✅ Production Live — Accountability System Active' 
            : '🧪 Staging Environment — Testing Mode'}
        </p>
        <p style={{ fontSize: '0.85rem', color: '#999' }}>
          Environment: <strong>{env.toUpperCase()}</strong>
        </p>
        <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
          Ready to turn irresponsible into responsible.
        </p>
      </div>
    </main>
  )
}