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

interface Escalation {
  id: number
  reason: string
  escalatedBy: string
  status: string
  createdAt: string
  resolvedAt?: string
}

interface Employee {
  id: number
  name: string
  email: string
  responsibilityScore: number
  createdAt: string
  reasonLogs: ReasonLog[]
  escalations: Escalation[]
}

interface SLARule {
  id: number
  scoreThreshold: number
  daysThreshold: number
  action: string
  escalateToRole: string
  active: boolean
}

interface RiskAssessment {
  assessments: (Employee & { riskLevel: string; riskReason: string })[]
  rules: SLARule[]
}

export default function Home() {
  const [env, setEnv] = useState<'production' | 'staging'>('production')
  const [tab, setTab] = useState<'employees' | 'risk' | 'rules'>('employees')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [riskData, setRiskData] = useState<RiskAssessment | null>(null)
  const [rules, setRules] = useState<SLARule[]>([])
  const [loading, setLoading] = useState(true)
  const [newEmployee, setNewEmployee] = useState({ name: '', email: '' })
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [adjusting, setAdjusting] = useState<number | null>(null)
  const [adjustForm, setAdjustForm] = useState({
    scoreChange: 0,
    reason: '',
    reportedBy: '',
  })
  const [newRule, setNewRule] = useState({
    scoreThreshold: 40,
    daysThreshold: 3,
  })

  useEffect(() => {
    const appEnv = (process.env.NEXT_PUBLIC_APP_ENV || 'production') as
      | 'production'
      | 'staging'
    setEnv(appEnv)
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [empRes, riskRes, rulesRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/risk-assessment'),
        fetch('/api/sla-rules'),
      ])

      const empData = await empRes.json()
      const riskData = await riskRes.json()
      const rulesData = await rulesRes.json()

      if (Array.isArray(empData)) {
        setEmployees(empData.sort((a, b) => b.responsibilityScore - a.responsibilityScore))
      }
      setRiskData(riskData)
      setRules(Array.isArray(rulesData) ? rulesData : [])
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const addEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmployee.name.trim() || !newEmployee.email.trim()) {
      alert('Please fill all fields')
      return
    }

    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee),
      })

      if (res.ok) {
        await fetchAll()
        setNewEmployee({ name: '', email: '' })
      }
    } catch (error) {
      console.error('Add error:', error)
    }
  }

  const adjustScore = async (employeeId: number) => {
    if (!adjustForm.reason.trim() || !adjustForm.reportedBy.trim() || adjustForm.scoreChange === 0) {
      alert('Please fill all fields')
      return
    }

    try {
      const res = await fetch(`/api/employees/${employeeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adjustForm),
      })

      if (res.ok) {
        await fetchAll()
        setAdjusting(null)
        setAdjustForm({ scoreChange: 0, reason: '', reportedBy: '' })
      }
    } catch (error) {
      console.error('Adjust error:', error)
    }
  }

  const addRule = async () => {
    try {
      const res = await fetch('/api/sla-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRule),
      })

      if (res.ok) {
        await fetchAll()
        setNewRule({ scoreThreshold: 40, daysThreshold: 3 })
      }
    } catch (error) {
      console.error('Rule error:', error)
    }
  }

  const getRiskColor = (level: string) => {
    if (level === 'red') return '#ef4444'
    if (level === 'yellow') return '#f59e0b'
    return '#10b981'
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

  const tabButtonStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.75rem 1.5rem',
    backgroundColor: active ? '#3b82f6' : '#e5e7eb',
    color: active ? 'white' : '#333',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginRight: '0.5rem',
    fontWeight: '500',
  })

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
        <div style={{ fontSize: '0.9rem', color: '#666' }}>
          {env === 'production' ? '✅ Production Live' : '🧪 Staging Environment'}
        </div>
      </div>

      {/* TABS */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
        <button style={tabButtonStyle(tab === 'employees')} onClick={() => setTab('employees')}>
          👥 Employees
        </button>
        <button style={tabButtonStyle(tab === 'risk')} onClick={() => setTab('risk')}>
          🔴 Risk Dashboard
        </button>
        <button style={tabButtonStyle(tab === 'rules')} onClick={() => setTab('rules')}>
          ⚙️ SLA Rules
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : tab === 'employees' ? (
        <>
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

          {/* Employees */}
          <h2>Employees & Accountability</h2>
          {employees.length === 0 ? (
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
        </>
      ) : tab === 'risk' ? (
        <div>
          <h2 style={{ marginBottom: '1rem' }}>🔴 Risk Dashboard — At-Risk Employees</h2>
          {riskData?.assessments && riskData.assessments.length > 0 ? (
            riskData.assessments
              .filter((emp) => emp.riskLevel !== 'green')
              .map((emp) => (
                <div key={emp.id} style={cardStyle}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{emp.name}</div>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>{emp.email}</div>
                      <div style={{ fontSize: '0.85rem', color: '#999', marginTop: '0.25rem' }}>
                        {emp.riskReason}
                      </div>
                    </div>
                    <div
                      style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        backgroundColor: getRiskColor(emp.riskLevel),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {emp.responsibilityScore}
                    </div>
                  </div>

                  {/* Escalations */}
                  {emp.escalations && emp.escalations.length > 0 && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                        📢 Escalation History:
                      </div>
                      {emp.escalations.map((esc) => (
                        <div
                          key={esc.id}
                          style={{
                            padding: '0.75rem',
                            backgroundColor: '#fef2f2',
                            borderLeft: '3px solid #ef4444',
                            marginBottom: '0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.9rem',
                          }}
                        >
                          <strong>{esc.reason}</strong> by {esc.escalatedBy} ({esc.status})
                          <br />
                          <span style={{ color: '#666', fontSize: '0.85rem' }}>
                            {new Date(esc.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
          ) : (
            <p style={{ color: '#999' }}>✅ No at-risk employees</p>
          )}
        </div>
      ) : (
        <div>
          <h2 style={{ marginBottom: '1rem' }}>⚙️ SLA Rules</h2>

          {/* Add Rule */}
          <div style={cardStyle}>
            <h3 style={{ marginBottom: '1rem' }}>Create New Rule</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                  Score Threshold
                </label>
                <input
                  type="number"
                  value={newRule.scoreThreshold}
                  onChange={(e) => setNewRule({ ...newRule, scoreThreshold: parseInt(e.target.value) })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                  Days Threshold
                </label>
                <input
                  type="number"
                  value={newRule.daysThreshold}
                  onChange={(e) => setNewRule({ ...newRule, daysThreshold: parseInt(e.target.value) })}
                  style={inputStyle}
                />
              </div>
            </div>
            <button onClick={addRule} style={buttonStyle}>
              Create Rule
            </button>
          </div>

          {/* Rules List */}
          <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Active Rules</h3>
          {rules && rules.length > 0 ? (
            rules.map((rule) => (
              <div key={rule.id} style={cardStyle}>
                <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Score &lt; {rule.scoreThreshold} for {rule.daysThreshold}+ days
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  Action: {rule.action} | Escalate to: {rule.escalateToRole}
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#999' }}>No rules created yet</p>
          )}
        </div>
      )}
    </div>
  )
}