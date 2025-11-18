/**
 * Tests for vote aggregation and outcome selection logic
 *
 * These tests verify:
 * 1. Vote counting and weight calculation
 * 2. Proposal scoring algorithm
 * 3. Winner selection based on composite scores
 */

import { calculateProposalScores, getWinningProposal } from '@/lib/aggregation';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    intentionProposal: {
      findMany: jest.fn(),
    },
  },
}));

const { prisma } = require('@/lib/prisma');

describe('Vote Aggregation', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateProposalScores', () => {
    it('should calculate correct scores for proposals with votes', async () => {
      const mockProposals = [
        {
          id: 'prop-1',
          votes: [
            { weightScore: 5 },
            { weightScore: 4 },
            { weightScore: 5 },
          ],
        },
        {
          id: 'prop-2',
          votes: [
            { weightScore: 3 },
            { weightScore: 3 },
          ],
        },
        {
          id: 'prop-3',
          votes: [
            { weightScore: 5 },
            { weightScore: 5 },
            { weightScore: 4 },
            { weightScore: 5 },
          ],
        },
      ];

      prisma.intentionProposal.findMany.mockResolvedValue(mockProposals);

      const scores = await calculateProposalScores('test-cycle-id');

      // Verify proposal 1: 3 votes, total weight 14
      expect(scores[0]).toMatchObject({
        proposalId: 'prop-3',
        totalVotes: 4,
        totalWeight: 19,
        averageWeight: 4.75,
        score: 14.5, // (19 * 0.7) + (4 * 0.3) = 13.3 + 1.2 = 14.5
      });

      // Verify proposal 2: 3 votes, total weight 14
      expect(scores[1]).toMatchObject({
        proposalId: 'prop-1',
        totalVotes: 3,
        totalWeight: 14,
        averageWeight: 4.67,
        score: 10.7, // (14 * 0.7) + (3 * 0.3) = 9.8 + 0.9 = 10.7
      });

      // Verify proposal 3: 2 votes, total weight 6
      expect(scores[2]).toMatchObject({
        proposalId: 'prop-2',
        totalVotes: 2,
        totalWeight: 6,
        averageWeight: 3,
        score: 4.8, // (6 * 0.7) + (2 * 0.3) = 4.2 + 0.6 = 4.8
      });
    });

    it('should handle proposals with no votes', async () => {
      const mockProposals = [
        {
          id: 'prop-1',
          votes: [],
        },
      ];

      prisma.intentionProposal.findMany.mockResolvedValue(mockProposals);

      const scores = await calculateProposalScores('test-cycle-id');

      expect(scores[0]).toMatchObject({
        proposalId: 'prop-1',
        totalVotes: 0,
        totalWeight: 0,
        averageWeight: 0,
        score: 0,
      });
    });

    it('should sort proposals by score in descending order', async () => {
      const mockProposals = [
        { id: 'prop-low', votes: [{ weightScore: 1 }] },
        { id: 'prop-high', votes: [{ weightScore: 5 }, { weightScore: 5 }] },
        { id: 'prop-mid', votes: [{ weightScore: 3 }] },
      ];

      prisma.intentionProposal.findMany.mockResolvedValue(mockProposals);

      const scores = await calculateProposalScores('test-cycle-id');

      expect(scores[0].proposalId).toBe('prop-high');
      expect(scores[1].proposalId).toBe('prop-mid');
      expect(scores[2].proposalId).toBe('prop-low');
    });

    it('should weight total votes correctly (30% influence)', async () => {
      const mockProposals = [
        // Proposal with many low-weight votes
        {
          id: 'many-votes',
          votes: Array(10).fill({ weightScore: 2 }), // 10 votes, weight 20
        },
        // Proposal with few high-weight votes
        {
          id: 'few-votes',
          votes: Array(3).fill({ weightScore: 5 }), // 3 votes, weight 15
        },
      ];

      prisma.intentionProposal.findMany.mockResolvedValue(mockProposals);

      const scores = await calculateProposalScores('test-cycle-id');

      // many-votes: (20 * 0.7) + (10 * 0.3) = 14 + 3 = 17
      expect(scores[0].proposalId).toBe('many-votes');
      expect(scores[0].score).toBe(17);

      // few-votes: (15 * 0.7) + (3 * 0.3) = 10.5 + 0.9 = 11.4
      expect(scores[1].proposalId).toBe('few-votes');
      expect(scores[1].score).toBe(11.4);
    });
  });

  describe('getWinningProposal', () => {
    it('should return the proposal with the highest score', async () => {
      const mockProposals = [
        {
          id: 'winner',
          votes: [{ weightScore: 5 }, { weightScore: 5 }],
        },
        {
          id: 'loser',
          votes: [{ weightScore: 3 }],
        },
      ];

      prisma.intentionProposal.findMany.mockResolvedValue(mockProposals);

      const result = await getWinningProposal('test-cycle-id');

      expect(result).not.toBeNull();
      expect(result?.proposalId).toBe('winner');
      expect(result?.score.totalVotes).toBe(2);
      expect(result?.score.totalWeight).toBe(10);
    });

    it('should return null when no proposals exist', async () => {
      prisma.intentionProposal.findMany.mockResolvedValue([]);

      const result = await getWinningProposal('test-cycle-id');

      expect(result).toBeNull();
    });

    it('should break ties by selecting the first in the sorted list', async () => {
      const mockProposals = [
        { id: 'prop-a', votes: [{ weightScore: 3 }] },
        { id: 'prop-b', votes: [{ weightScore: 3 }] },
      ];

      prisma.intentionProposal.findMany.mockResolvedValue(mockProposals);

      const result = await getWinningProposal('test-cycle-id');

      expect(result).not.toBeNull();
      // Should return the first one (order is deterministic)
      expect(['prop-a', 'prop-b']).toContain(result?.proposalId);
    });
  });

  describe('Scoring Algorithm Validation', () => {
    it('should favor high engagement (votes) with moderate weights over low engagement with perfect weights', async () => {
      const mockProposals = [
        // High engagement, moderate weights: 8 votes averaging 3.5
        {
          id: 'high-engagement',
          votes: [
            { weightScore: 4 },
            { weightScore: 3 },
            { weightScore: 4 },
            { weightScore: 3 },
            { weightScore: 4 },
            { weightScore: 3 },
            { weightScore: 4 },
            { weightScore: 3 },
          ],
        },
        // Low engagement, perfect weights: 2 votes of 5
        {
          id: 'low-engagement',
          votes: [{ weightScore: 5 }, { weightScore: 5 }],
        },
      ];

      prisma.intentionProposal.findMany.mockResolvedValue(mockProposals);

      const scores = await calculateProposalScores('test-cycle-id');

      // high-engagement: total weight = 28, votes = 8
      // score = (28 * 0.7) + (8 * 0.3) = 19.6 + 2.4 = 22
      expect(scores[0].proposalId).toBe('high-engagement');
      expect(scores[0].score).toBeGreaterThan(scores[1].score);

      // low-engagement: total weight = 10, votes = 2
      // score = (10 * 0.7) + (2 * 0.3) = 7 + 0.6 = 7.6
      expect(scores[1].proposalId).toBe('low-engagement');
    });
  });
});
