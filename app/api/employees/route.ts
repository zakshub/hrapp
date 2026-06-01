import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      include: { reasonLogs: true },
      orderBy: { responsibilityScore: 'desc' },
    })
    return NextResponse.json(employees)
  } catch (error) {
    console.error('GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email } = await req.json()

    const employee = await prisma.employee.create({
      data: {
        name,
        email,
        responsibilityScore: 50,
      },
      include: { reasonLogs: true },
    })

    return NextResponse.json(employee, { status: 201 })
  } catch (error) {
    console.error('POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    )
  }
}