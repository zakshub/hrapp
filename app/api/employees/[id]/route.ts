import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { scoreChange, reason, reportedBy } = await req.json()
    const id = parseInt(params.id)

    // Fetch current employee
    const current = await prisma.employee.findUnique({
      where: { id },
      include: { reasonLogs: true },
    })

    if (!current) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    // Calculate new score (clamp 0-100)
    let newScore = current.responsibilityScore + scoreChange
    newScore = Math.max(0, Math.min(100, newScore))

    // Update employee
    const updated = await prisma.employee.update({
      where: { id },
      data: { responsibilityScore: newScore },
      include: { reasonLogs: true },
    })

    // Log the reason (mandatory)
    if (reason && reportedBy) {
      await prisma.reasonLog.create({
        data: {
          employeeId: id,
          reason,
          description: `Score changed from ${current.responsibilityScore} to ${newScore}`,
          reportedBy,
          scoreImpact: scoreChange,
        },
      })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('PATCH error:', error)
    return NextResponse.json(
      { error: 'Failed to update employee' },
      { status: 500 }
    )
  }
}