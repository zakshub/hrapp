import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const rules = await prisma.sLARule.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(rules)
  } catch (error) {
    console.error('GET rules error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch SLA rules' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { scoreThreshold, daysThreshold, action, escalateToRole } =
      await req.json()

    const rule = await prisma.sLARule.create({
      data: {
        scoreThreshold: scoreThreshold || 40,
        daysThreshold: daysThreshold || 3,
        action: action || 'alert',
        escalateToRole: escalateToRole || 'manager',
      },
    })

    return NextResponse.json(rule, { status: 201 })
  } catch (error) {
    console.error('POST rule error:', error)
    return NextResponse.json(
      { error: 'Failed to create SLA rule' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const ruleId = parseInt(searchParams.get('id') || '0')

    await prisma.sLARule.update({
      where: { id: ruleId },
      data: { active: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE rule error:', error)
    return NextResponse.json(
      { error: 'Failed to delete SLA rule' },
      { status: 500 }
    )
  }
}