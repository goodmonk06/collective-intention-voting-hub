import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getWinningProposal } from '@/lib/aggregation';

// POST /api/cycles/[id]/select-outcome - Select the winning proposal and create outcome
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cycleId } = await params;

    // Check if cycle exists
    const cycle = await prisma.intentionCycle.findUnique({
      where: { id: cycleId },
      include: {
        outcomes: true,
      },
    });

    if (!cycle) {
      return NextResponse.json(
        { error: 'Cycle not found' },
        { status: 404 }
      );
    }

    // Check if outcome already exists
    if (cycle.outcomes.length > 0) {
      return NextResponse.json(
        { error: 'Outcome already selected for this cycle' },
        { status: 409 }
      );
    }

    // Get winning proposal
    const winner = await getWinningProposal(cycleId);

    if (!winner) {
      return NextResponse.json(
        { error: 'No proposals found for this cycle' },
        { status: 404 }
      );
    }

    // Get full proposal details
    const proposal = await prisma.intentionProposal.findUnique({
      where: { id: winner.proposalId },
      include: {
        votes: true,
      },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: 'Winning proposal not found' },
        { status: 404 }
      );
    }

    // Create summary
    const summaryMarkdown = `# Selected Intention: ${proposal.title}

## Voting Results
- **Total Votes**: ${winner.score.totalVotes}
- **Total Weight**: ${winner.score.totalWeight}
- **Average Weight**: ${winner.score.averageWeight}/5
- **Final Score**: ${winner.score.score}

## Proposal Details
${proposal.bodyMarkdown}

---
*This intention was collectively chosen by the community for ${cycle.title}*`;

    // Create outcome record
    const outcome = await prisma.intentionOutcome.create({
      data: {
        cycleId,
        selectedProposalId: winner.proposalId,
        summaryMarkdown,
        aiSummaryJson: JSON.stringify({
          proposalTitle: proposal.title,
          voteStats: winner.score,
          selectedAt: new Date().toISOString(),
        }),
      },
      include: {
        selectedProposal: {
          include: {
            votes: true,
          },
        },
      },
    });

    // Close voting window
    await prisma.intentionCycle.update({
      where: { id: cycleId },
      data: {
        votingWindowOpen: false,
        proposalWindowOpen: false,
      },
    });

    return NextResponse.json(outcome, { status: 201 });
  } catch (error) {
    console.error('Error selecting outcome:', error);
    return NextResponse.json(
      { error: 'Failed to select outcome' },
      { status: 500 }
    );
  }
}

// GET /api/cycles/[id]/select-outcome - Get the current outcome for a cycle
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cycleId } = await params;

    const outcome = await prisma.intentionOutcome.findUnique({
      where: { cycleId },
      include: {
        selectedProposal: {
          include: {
            votes: true,
          },
        },
        cycle: true,
      },
    });

    if (!outcome) {
      return NextResponse.json(
        { error: 'No outcome found for this cycle' },
        { status: 404 }
      );
    }

    return NextResponse.json(outcome);
  } catch (error) {
    console.error('Error fetching outcome:', error);
    return NextResponse.json(
      { error: 'Failed to fetch outcome' },
      { status: 500 }
    );
  }
}
