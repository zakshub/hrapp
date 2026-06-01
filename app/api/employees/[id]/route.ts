import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { responsibilityScore, reason, description, reportedBy } =
      await req.json()

    // Update employee score
    const employee = await prisma.employee.update({
      where: { id: parseInt(params.id) },
      data: { responsibilityScore },
    })

    // Log the reason if provided
    if (reason) {
      await prisma.reasonLog.create({
        data: {
          employeeId: parseInt(params.id),
          reason,
          description,
          reportedBy,
          scoreImpact: responsibilityScore - (employee.responsibilityScore || 50),
        },
      })
    }

    return NextResponse.json(employee)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update employee' },
      { status: 500 }
    )
  }
}