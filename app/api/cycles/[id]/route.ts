import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateCycleSchema = z.object({
  proposalWindowOpen: z.boolean().optional(),
  votingWindowOpen: z.boolean().optional(),
});

// PATCH /api/cycles/[id] - Update cycle windows
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validated = updateCycleSchema.parse(body);

    const cycle = await prisma.intentionCycle.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json(cycle);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating cycle:', error);
    return NextResponse.json(
      { error: 'Failed to update cycle' },
      { status: 500 }
    );
  }
}
