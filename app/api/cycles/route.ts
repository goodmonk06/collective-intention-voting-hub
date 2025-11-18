import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createCycleSchema = z.object({
  communityId: z.string().optional(),
  key: z.string().min(1),
  title: z.string().min(1),
  descriptionMarkdown: z.string(),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
  proposalWindowOpen: z.boolean().optional(),
  votingWindowOpen: z.boolean().optional(),
});

// POST /api/cycles - Create a new intention cycle
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = createCycleSchema.parse(body);

    const cycle = await prisma.intentionCycle.create({
      data: {
        communityId: validated.communityId,
        key: validated.key,
        title: validated.title,
        descriptionMarkdown: validated.descriptionMarkdown,
        periodStart: new Date(validated.periodStart),
        periodEnd: new Date(validated.periodEnd),
        proposalWindowOpen: validated.proposalWindowOpen ?? true,
        votingWindowOpen: validated.votingWindowOpen ?? false,
      },
    });

    return NextResponse.json(cycle, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating cycle:', error);
    return NextResponse.json(
      { error: 'Failed to create cycle' },
      { status: 500 }
    );
  }
}

// GET /api/cycles - List all intention cycles
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const communityId = searchParams.get('communityId');
    const active = searchParams.get('active');

    const where: any = {};

    if (communityId) {
      where.communityId = communityId;
    }

    if (active === 'true') {
      const now = new Date();
      where.periodStart = { lte: now };
      where.periodEnd = { gte: now };
    }

    const cycles = await prisma.intentionCycle.findMany({
      where,
      include: {
        _count: {
          select: {
            proposals: true,
          },
        },
      },
      orderBy: {
        periodStart: 'desc',
      },
    });

    return NextResponse.json(cycles);
  } catch (error) {
    console.error('Error fetching cycles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cycles' },
      { status: 500 }
    );
  }
}
