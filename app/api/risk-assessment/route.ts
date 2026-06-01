import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      include: { reasonLogs: true, escalations: true },
      orderBy: { responsibilityScore: 'asc' },
    })

    const rules = await prisma.sLARule.findMany({
      where: { active: true },
    })

    // Calculate risk for each employee
    const assessments = employees.map((emp) => {
      const rule = rules[0] // Use first active rule
      let riskLevel = 'green'
      let riskReason = ''

      if (!rule) {
        return { ...emp, riskLevel, riskReason }
      }

      if (emp.responsibilityScore < rule.scoreThreshold) {
        // Check how many days score has been low
        const lowScoreLogs = emp.reasonLogs.filter(
          (log) => log.scoreImpact < 0
        )
        const daysLow = new Set(
          lowScoreLogs.map(
            (log) =>
              new Date(log.createdAt).toISOString().split('T')[0]
          )
        ).size

        if (daysLow >= rule.daysThreshold) {
          riskLevel = 'red'
          riskReason = `Score ${emp.responsibilityScore} for ${daysLow} days (threshold: ${rule.daysThreshold})`
        } else {
          riskLevel = 'yellow'
          riskReason = `Score ${emp.responsibilityScore} below threshold ${rule.scoreThreshold}`
        }
      } else {
        riskLevel = 'green'
        riskReason = 'On track'
      }

      return { ...emp, riskLevel, riskReason }
    })

    return NextResponse.json({
      assessments,
      rules,
      lastChecked: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Risk assessment error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate risk' },
      { status: 500 }
    )
  }
}