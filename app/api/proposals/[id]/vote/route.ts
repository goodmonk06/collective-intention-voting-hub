import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createVoteSchema = z.object({
  voterMemberId: z.string().optional(),
  weightScore: z.number().int().min(1).max(5),
  resonanceTags: z.array(z.string()).optional(),
});

// POST /api/proposals/[id]/vote - Submit a vote for a proposal
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: proposalId } = await params;
    const body = await req.json();
    const validated = createVoteSchema.parse(body);

    // Check if proposal exists and voting window is open
    const proposal = await prisma.intentionProposal.findUnique({
      where: { id: proposalId },
      include: {
        cycle: true,
      },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }

    if (!proposal.cycle.votingWindowOpen) {
      return NextResponse.json(
        { error: 'Voting window is closed for this cycle' },
        { status: 403 }
      );
    }

    // Check if user already voted (using upsert to handle duplicates)
    const vote = await prisma.intentionVote.upsert({
      where: {
        proposalId_voterMemberId: {
          proposalId,
          voterMemberId: validated.voterMemberId || '',
        },
      },
      update: {
        weightScore: validated.weightScore,
        resonanceTagJson: JSON.stringify(validated.resonanceTags || []),
      },
      create: {
        proposalId,
        voterMemberId: validated.voterMemberId,
        weightScore: validated.weightScore,
        resonanceTagJson: JSON.stringify(validated.resonanceTags || []),
      },
    });

    return NextResponse.json(vote, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error submitting vote:', error);
    return NextResponse.json(
      { error: 'Failed to submit vote' },
      { status: 500 }
    );
  }
}
