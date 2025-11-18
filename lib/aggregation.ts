import { prisma } from '@/lib/prisma';

export interface ProposalScore {
  proposalId: string;
  totalVotes: number;
  totalWeight: number;
  averageWeight: number;
  score: number; // Combined metric for ranking
}

/**
 * Calculate vote statistics for all proposals in a cycle
 * Score = (totalWeight * 0.7) + (totalVotes * 0.3)
 * This balances both the intensity (weight) and breadth (count) of support
 */
export async function calculateProposalScores(
  cycleId: string
): Promise<ProposalScore[]> {
  const proposals = await prisma.intentionProposal.findMany({
    where: { cycleId },
    include: {
      votes: {
        select: {
          weightScore: true,
        },
      },
    },
  });

  const scores = proposals.map((proposal) => {
    const totalVotes = proposal.votes.length;
    const totalWeight = proposal.votes.reduce(
      (sum, vote) => sum + vote.weightScore,
      0
    );
    const averageWeight = totalVotes > 0 ? totalWeight / totalVotes : 0;

    // Calculate composite score (weighted combination)
    const score = totalWeight * 0.7 + totalVotes * 0.3;

    return {
      proposalId: proposal.id,
      totalVotes,
      totalWeight,
      averageWeight: Math.round(averageWeight * 100) / 100,
      score: Math.round(score * 100) / 100,
    };
  });

  // Sort by score descending
  return scores.sort((a, b) => b.score - a.score);
}

/**
 * Get the winning proposal for a cycle
 */
export async function getWinningProposal(
  cycleId: string
): Promise<{ proposalId: string; score: ProposalScore } | null> {
  const scores = await calculateProposalScores(cycleId);

  if (scores.length === 0) {
    return null;
  }

  return {
    proposalId: scores[0].proposalId,
    score: scores[0],
  };
}
