import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createProposalSchema = z.object({
  proposerMemberId: z.string().optional(),
  title: z.string().min(1),
  bodyMarkdown: z.string(),
  tags: z.array(z.string()).optional(),
});

// POST /api/cycles/[id]/proposals - Create a new proposal for a cycle
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cycleId } = await params;
    const body = await req.json();
    const validated = createProposalSchema.parse(body);

    // Check if cycle exists and proposal window is open
    const cycle = await prisma.intentionCycle.findUnique({
      where: { id: cycleId },
    });

    if (!cycle) {
      return NextResponse.json(
        { error: 'Cycle not found' },
        { status: 404 }
      );
    }

    if (!cycle.proposalWindowOpen) {
      return NextResponse.json(
        { error: 'Proposal window is closed for this cycle' },
        { status: 403 }
      );
    }

    const proposal = await prisma.intentionProposal.create({
      data: {
        cycleId,
        proposerMemberId: validated.proposerMemberId,
        title: validated.title,
        bodyMarkdown: validated.bodyMarkdown,
        tagsJson: JSON.stringify(validated.tags || []),
      },
    });

    return NextResponse.json(proposal, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating proposal:', error);
    return NextResponse.json(
      { error: 'Failed to create proposal' },
      { status: 500 }
    );
  }
}

// GET /api/cycles/[id]/proposals - List all proposals for a cycle with vote stats
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cycleId } = await params;

    const proposals = await prisma.intentionProposal.findMany({
      where: { cycleId },
      include: {
        votes: {
          select: {
            weightScore: true,
            resonanceTagJson: true,
          },
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate aggregated vote stats for each proposal
    const proposalsWithStats = proposals.map((proposal) => {
      const totalVotes = proposal.votes.length;
      const totalWeight = proposal.votes.reduce(
        (sum, vote) => sum + vote.weightScore,
        0
      );
      const averageWeight = totalVotes > 0 ? totalWeight / totalVotes : 0;

      // Aggregate resonance tags
      const resonanceTags: Record<string, number> = {};
      proposal.votes.forEach((vote) => {
        try {
          const tags = JSON.parse(vote.resonanceTagJson);
          tags.forEach((tag: string) => {
            resonanceTags[tag] = (resonanceTags[tag] || 0) + 1;
          });
        } catch (e) {
          // Skip invalid JSON
        }
      });

      return {
        id: proposal.id,
        cycleId: proposal.cycleId,
        proposerMemberId: proposal.proposerMemberId,
        title: proposal.title,
        bodyMarkdown: proposal.bodyMarkdown,
        tags: JSON.parse(proposal.tagsJson),
        createdAt: proposal.createdAt,
        voteStats: {
          totalVotes,
          totalWeight,
          averageWeight: Math.round(averageWeight * 100) / 100,
          resonanceTags,
        },
      };
    });

    return NextResponse.json(proposalsWithStats);
  } catch (error) {
    console.error('Error fetching proposals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch proposals' },
      { status: 500 }
    );
  }
}
