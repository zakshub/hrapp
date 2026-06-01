import { sendAlertEmail } from '@/lib/email'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { employeeId } = await req.json()

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { reasonLogs: true },
    })

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    if (!employee.managerEmail) {
      return NextResponse.json(
        { error: 'Manager email not set for this employee' },
        { status: 400 }
      )
    }

    // Calculate risk reason
    const lowScoreLogs = employee.reasonLogs.filter((log) => log.scoreImpact < 0)
    const daysLow = new Set(
      lowScoreLogs.map((log) =>
        new Date(log.createdAt).toISOString().split('T')[0]
      )
    ).size

    const riskReason =
      daysLow >= 3
        ? `Score ${employee.responsibilityScore} below threshold for ${daysLow} days`
        : `Score ${employee.responsibilityScore} below acceptable level`

    // Send email
    const result = await sendAlertEmail(
      employee.managerEmail,
      employee.name,
      employee.responsibilityScore,
      riskReason
    )

    if (result.success) {
      // Create escalation record
      await prisma.escalation.create({
        data: {
          employeeId: employee.id,
          reason: `Email alert sent to ${employee.managerEmail}`,
          escalatedBy: 'email-system',
          status: 'active',
        },
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Send alert error:', error)
    return NextResponse.json(
      { error: 'Failed to send alert' },
      { status: 500 }
    )
  }
}