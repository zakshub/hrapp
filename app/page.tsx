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
    const appEnv = (process.env.NEXT_PUBLIC_APP_ENV || 'production') as
      | 'production'
      | 'staging'
    setEnv(appEnv)
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees')
      if (res.ok) {
        const data = await res.json()
        setEmployees(data.sort((a: Employee, b: Employee) => b.responsibilityScore - a.responsibilityScore))
      }
    } catch (error) {
      console.error('Failed to fetch:', error)
    } finally {
      setLoading(false)
    }
  }

  const addEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmployee.name || !newEmployee.email) return

    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee),
      })

      if (res.ok) {
        const emp = await res.json()
        setEmployees([...employees, emp].sort((a, b) => b.responsibilityScore - a.responsibilityScore))
        setNewEmployee({ name: '', email: '' })
      }
    } catch (error) {
      console.error('Failed to add:', error)
    }
  }

  const adjustScore = async (employeeId: number) => {
    if (!adjustForm.reason || !adjustForm.reportedBy || adjustForm.scoreChange === 0) {
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
            .sort((a, b) => b.responsibilityScore - a.responsibilityScore)
        )
        setAdjusting(null)
        setAdjustForm({ scoreChange: 0, reason: '', reportedBy: '' })
      }
    } catch (error) {
      console.error('Failed to adjust:', error)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return '#10b981' // green
    if (score >= 50) return '#f59e0b' // orange
    return '#ef4444' // red
  }

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#f9fafb',
      minHeight: '100vh',
    },
    header: {
      marginBottom: '2rem',
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
    },
    envBadge: {
      fontSize: '0.9rem',
      color: '#666',
      marginBottom: '0.5rem',
    },
    card: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '1.5rem',
    },
    form: {
      display: 'grid',
      gap: '1rem',
      marginBottom: '1rem',
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
    },
    input: {
      padding: '0.75rem',
      border: '1px solid #ddd',
      borderRadius: '6px',
      fontSize: '1rem',
      fontFamily: 'inherit',
    },
    button: {
      padding: '0.75rem 1.5rem',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '500',
    },
    employeeCard: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '1rem',
    },
    employeeHeader: {
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gap: '1rem',
      alignItems: 'center',
      marginBottom: '1rem',
    },
    employeeInfo: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.25rem',
    },
    employeeName: {
      fontSize: '1.1rem',
      fontWeight: '600',
    },
    employeeEmail: {
      fontSize: '0.9rem',
      color: '#666',
    },
    scoreDisplay: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      padding: '1rem 1.5rem',
      borderRadius: '8px',
      backgroundColor: '#f3f4f6',
    },
    adjustSection: {
      backgroundColor: '#f9fafb',
      padding: '1rem',
      borderRadius: '6px',
      marginTop: '1rem',
    },
    adjustControls: {
      display: 'grid',
      gap: '0.75rem',
      marginBottom: '1rem',
    },
    scoreButtons: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '0.5rem',
    },
    scoreBtn: (active: boolean) => ({
      padding: '0.5rem',
      backgroundColor: active ? '#3b82f6' : '#e5e7eb',
      color: active ? 'white' : '#333',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: '500',
    }),
    reasonLog: {
      marginTop: '1rem',
      paddingTop: '1rem',
      borderTop: '1px solid #e5e7eb',
    },
    logEntry: {
      padding: '0.75rem',
      backgroundColor: '#f3f4f6',
      borderLeft: '3px solid #3b82f6',
      marginBottom: '0.5rem',
      borderRadius: '4px',
      fontSize: '0.9rem',
    },
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>🚀 Responsify HR</div>
        <div style={styles.envBadge}>
          {env === 'production' ? '✅ Production Live' : '🧪 Staging Environment'}
        </div>
      </div>

      {/* Add Employee */}
      <div style={styles.card}>
        <h2 style={{ marginBottom: '1rem' }}>➕ Add Employee</h2>
        <form onSubmit={addEmployee} style={styles.form}>
          <div style={styles.formGrid}>
            <input
              type="text"
              placeholder="Name"
              value={newEmployee.name}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, name: e.target.value })
              }
              style={styles.input}
            />
            <input
              type="email"
              placeholder="Email"
              value={newEmployee.email}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, email: e.target.value })
              }
              style={styles.input}
            />
          </div>
          <button type="submit" style={styles.button}>
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
            <div key={emp.id} style={styles.employeeCard}>
              <div style={styles.employeeHeader}>
                <div style={styles.employeeInfo}>
                  <div style={styles.employeeName}>{emp.name}</div>
                  <div style={styles.employeeEmail}>{emp.email}</div>
                </div>
                <div
                  style={{
                    ...styles.scoreDisplay,
                    color: getScoreColor(emp.responsibilityScore),
                  }}
                >
                  {emp.responsibilityScore}
                </div>
              </div>

              {/* Adjust Score */}
              {adjusting === emp.id ? (
                <div style={styles.adjustSection}>
                  <div style={styles.adjustControls}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                      Score Change:
                    </label>
                    <div style={styles.scoreButtons}>
                      {[-10, -5, 5, 10].map((change) => (
                        <button
                          key={change}
                          onClick={() =>
                            setAdjustForm({ ...adjustForm, scoreChange: change })
                          }
                          style={styles.scoreBtn(
                            adjustForm.scoreChange === change
                          )}
                        >
                          {change > 0 ? '+' : ''}{change}
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      placeholder="Reason (required)"
                      value={adjustForm.reason}
                      onChange={(e) =>
                        setAdjustForm({ ...adjustForm, reason: e.target.value })
                      }
                      style={styles.input}
                    />

                    <input
                      type="text"
                      placeholder="Reported by (your name)"
                      value={adjustForm.reportedBy}
                      onChange={(e) =>
                        setAdjustForm({
                          ...adjustForm,
                          reportedBy: e.target.value,
                        })
                      }
                      style={styles.input}
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <button
                        onClick={() => adjustScore(emp.id)}
                        style={{ ...styles.button, backgroundColor: '#10b981' }}
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => {
                          setAdjusting(null)
                          setAdjustForm({
                            scoreChange: 0,
                            reason: '',
                            reportedBy: '',
                          })
                        }}
                        style={{ ...styles.button, backgroundColor: '#999' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAdjusting(emp.id)}
                  style={{
                    ...styles.button,
                    width: '100%',
                    backgroundColor: '#8b5cf6',
                  }}
                >
                  Adjust Score & Log Reason
                </button>
              )}

              {/* Reason Log */}
              {emp.reasonLogs.length > 0 && (
                <div style={styles.reasonLog}>
                  <button
                    onClick={() =>
                      setExpandedId(expandedId === emp.id ? null : emp.id)
                    }
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
                        <div key={log.id} style={styles.logEntry}>
                          <strong>{log.reason}</strong> ({log.scoreImpact > 0 ? '+' : ''}{log.scoreImpact}) by {log.reportedBy}
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