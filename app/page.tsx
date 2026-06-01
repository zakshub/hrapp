'use client'

import { useEffect, useState } from 'react'

interface Employee {
  id: number
  name: string
  email: string
  responsibilityScore: number
  createdAt: string
}

export default function Home() {
  const [env, setEnv] = useState<'production' | 'staging'>('production')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const appEnv = (process.env.NEXT_PUBLIC_APP_ENV || 'production') as
      | 'production'
      | 'staging'
    setEnv(appEnv)

    // Fetch employees
    const fetchEmployees = async () => {
      try {
        const res = await fetch('/api/employees')
        if (res.ok) {
          const data = await res.json()
          setEmployees(data)
        }
      } catch (error) {
        console.error('Failed to fetch employees:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEmployees()
  }, [])

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1>🚀 Responsify HR</h1>
        <p style={{ fontSize: '0.95rem', color: '#666' }}>
          {env === 'production'
            ? '✅ Production Live — Accountability System Active'
            : '🧪 Staging Environment — Testing Mode'}
        </p>
        <p style={{ fontSize: '0.85rem', color: '#999' }}>
          Environment: <strong>{env.toUpperCase()}</strong>
        </p>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>Employees & Responsibility Scores</h2>
        {loading ? (
          <p>Loading...</p>
        ) : employees.length === 0 ? (
          <p style={{ color: '#999' }}>
            No employees yet. Add one via POST /api/employees
          </p>
        ) : (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginTop: '1rem',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '2px solid #ccc' }}>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Email</th>
                <th style={{ textAlign: 'center', padding: '0.5rem' }}>
                  Score
                </th>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>
                  Joined
                </th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.5rem' }}>{emp.name}</td>
                  <td style={{ padding: '0.5rem' }}>{emp.email}</td>
                  <td
                    style={{
                      textAlign: 'center',
                      padding: '0.5rem',
                      fontWeight: 'bold',
                      color:
                        emp.responsibilityScore >= 70
                          ? 'green'
                          : emp.responsibilityScore >= 50
                            ? 'orange'
                            : 'red',
                    }}
                  >
                    {emp.responsibilityScore}
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    {new Date(emp.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  )
}