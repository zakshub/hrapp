'use client'

import { useEffect, useState } from 'react'

interface ReasonLog {
  id: number
  reason: string
  description?: string
  reportedBy: string
  scoreImpact: number
  createdAt: string
}

interface Employee {
  id: number
  name: string
  email: string
  responsibilityScore: number
  createdAt: string
  reasonLogs: ReasonLog[]
}

export default function Home() {
  const [env, setEnv] = useState<'production' | 'staging'>('production')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [newEmployee, setNewEmployee] = useState({ name: '', email: '' })
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [adjusting, setAdjusting] = useState<number | null>(null)
  const [adjustForm, setAdjustForm] = useState({
    scoreChange: 0,
    reason: '',
    reportedBy: '',
  })

  useEffect(() => {
    const appEnv = (process.env.NEXT_PUBLIC_APP_ENV || 'production') as 'production' | 'staging'
    setEnv(appEnv)
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/employees')
      const data = await res.json()
      
      if (Array.isArray(data)) {
        setEmployees(data.sort((a: Employee, b: Employee) => b.responsibilityScore - a.responsibilityScore))
      } else {
        console.error('Invalid data format:', data)
        setEmployees([])
      }
    } catch (error) {
      console.error('Fetch error:', error)
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }

  const addEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmployee.name.trim() || !newEmployee.email.trim()) {
      alert('Please fill in all fields')
      return
    }

    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee),
      })

      if (res.ok) {
        const emp = await res.json()
        setEmployees([...employees, emp].sort((a: Employee, b: Employee) => b.responsibilityScore - a.responsibilityScore))
        setNewEmployee({ name: '', email: '' })
      } else {
        alert('Failed to add employee')
      }
    } catch (error) {
      console.error('Add error:', error)
      alert('Error adding employee')
    }
  }

  const adjustScore = async (employeeId: number) => {
    if (!adjustForm.reason.trim() || !adjustForm.reportedBy.trim() || adjustForm.scoreChange === 0) {
      alert('Please fill all fields and select a change')
      return
    }

    try {
      const res = await fetch(`/api/employees/${employeeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adjustForm),
      })

      if (res.ok) {
        const updated = await res.json()
        setEmployees(
          employees
            .map((e) => (e.id === employeeId ? updated : e))
            .sort((a: Employee, b: Employee) => b.responsibilityScore - a.responsibilityScore)
        )
        setAdjusting(null)
        setAdjustForm({ scoreChange: 0, reason: '', reportedBy: '' })
      } else {
        alert('Failed to adjust score')
      }
    } catch (error) {
      console.error('Adjust error:', error)
      alert('Error adjusting score')
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return '#10b981'
    if (score >= 50) return '#f59e0b'
    return '#ef4444'
  }

  const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#f9fafb',
    minHeight: '100vh',
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '1.5rem',
  }

  const inputStyle: React.CSSProperties = {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '1rem',
    width: '100%',
    boxSizing: 'border-box',
  }

  const buttonStyle: React.CSSProperties = {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    width: '100%',
  }

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          🚀 Responsify HR
        </div>
        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
          {env === 'production' ? '✅ Production Live' : '🧪 Staging Environment'}
        </div>
      </div>

      {/* Add Employee */}
      <div style={cardStyle}>
        <h2 style={{ marginBottom: '1rem' }}>➕ Add Employee</h2>
        <form onSubmit={addEmployee}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Name"
              value={newEmployee.name}
              onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
              style={inputStyle}
            />
            <input
              type="email"
              placeholder="Email"
              value={newEmployee.email}
              onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
              style={inputStyle}
            />
          </div>
          <button type="submit" style={buttonStyle}>
            Add Employee
          </button>
        </form>
      </div>

      {/* Employees List */}
      <div>
        <h2 style={{ marginBottom: '1rem' }}>👥 Employees & Accountability</h2>
        {loading ? (
          <p>Loading...</p>
        ) : employees.length === 0 ? (
          <p style={{ color: '#999' }}>No employees yet</p>
        ) : (
          employees.map((emp) => (
            <div key={emp.id} style={cardStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{emp.name}</div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>{emp.email}</div>
                </div>
                <div
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    padding: '1rem 1.5rem',
                    borderRadius: '8px',
                    backgroundColor: '#f3f4f6',
                    color: getScoreColor(emp.responsibilityScore),
                  }}
                >
                  {emp.responsibilityScore}
                </div>
              </div>

              {/* Adjust Score */}
              {adjusting === emp.id ? (
                <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '6px', marginTop: '1rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>
                    Score Change:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                    {[-10, -5, 5, 10].map((change) => (
                      <button
                        key={change}
                        onClick={() => setAdjustForm({ ...adjustForm, scoreChange: change })}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: adjustForm.scoreChange === change ? '#3b82f6' : '#e5e7eb',
                          color: adjustForm.scoreChange === change ? 'white' : '#333',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '500',
                        }}
                      >
                        {change > 0 ? '+' : ''}{change}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Reason (required)"
                    value={adjustForm.reason}
                    onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                    style={{ ...inputStyle, marginBottom: '0.75rem' }}
                  />

                  <input
                    type="text"
                    placeholder="Reported by"
                    value={adjustForm.reportedBy}
                    onChange={(e) => setAdjustForm({ ...adjustForm, reportedBy: e.target.value })}
                    style={{ ...inputStyle, marginBottom: '1rem' }}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <button
                      onClick={() => adjustScore(emp.id)}
                      style={{ ...buttonStyle, backgroundColor: '#10b981' }}
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => {
                        setAdjusting(null)
                        setAdjustForm({ scoreChange: 0, reason: '', reportedBy: '' })
                      }}
                      style={{ ...buttonStyle, backgroundColor: '#999' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAdjusting(emp.id)}
                  style={{ ...buttonStyle, backgroundColor: '#8b5cf6' }}
                >
                  Adjust Score & Log Reason
                </button>
              )}

              {/* Reason Log */}
              {emp.reasonLogs && emp.reasonLogs.length > 0 && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                  <button
                    onClick={() => setExpandedId(expandedId === emp.id ? null : emp.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      color: '#3b82f6',
                      padding: '0',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {expandedId === emp.id ? '▼' : '▶'} Reason Log ({emp.reasonLogs.length})
                  </button>

                  {expandedId === emp.id && (
                    <div>
                      {emp.reasonLogs.map((log) => (
                        <div
                          key={log.id}
                          style={{
                            padding: '0.75rem',
                            backgroundColor: '#f3f4f6',
                            borderLeft: '3px solid #3b82f6',
                            marginBottom: '0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.9rem',
                          }}
                        >
                          <strong>{log.reason}</strong> ({log.scoreImpact > 0 ? '+' : ''}{log.scoreImpact}) by{' '}
                          {log.reportedBy}
                          <br />
                          <span style={{ color: '#666', fontSize: '0.85rem' }}>
                            {new Date(log.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}