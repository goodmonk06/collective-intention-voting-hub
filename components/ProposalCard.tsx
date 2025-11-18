'use client';

import { useState } from 'react';

interface ProposalCardProps {
  proposal: {
    id: string;
    title: string;
    bodyMarkdown: string;
    tags: string[];
    proposerMemberId?: string | null;
    voteStats: {
      totalVotes: number;
      averageWeight: number;
      resonanceTags: Record<string, number>;
    };
  };
  onVote?: (proposalId: string, weight: number, tags: string[]) => Promise<void>;
  votingOpen: boolean;
}

export default function ProposalCard({
  proposal,
  onVote,
  votingOpen,
}: ProposalCardProps) {
  const [selectedWeight, setSelectedWeight] = useState(3);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const resonanceOptions = [
    'inspiring',
    'practical',
    'transformative',
    'timely',
    'bold',
    'grounded',
  ];

  const handleVote = async () => {
    if (!onVote) return;

    setIsVoting(true);
    try {
      await onVote(proposal.id, selectedWeight, selectedTags);
      setHasVoted(true);
    } catch (error) {
      console.error('Failed to vote:', error);
      alert('Failed to submit vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-xl font-bold mb-2">{proposal.title}</h3>
      <div className="prose prose-sm max-w-none mb-4">
        <p className="text-gray-700 whitespace-pre-wrap">{proposal.bodyMarkdown}</p>
      </div>

      {proposal.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {proposal.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="border-t pt-4 mb-4">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="font-semibold">
            {proposal.voteStats.totalVotes} votes
          </span>
          <span>
            Avg: {proposal.voteStats.averageWeight.toFixed(1)}/5
          </span>
        </div>

        {Object.keys(proposal.voteStats.resonanceTags).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(proposal.voteStats.resonanceTags).map(
              ([tag, count]) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded"
                >
                  {tag} ({count})
                </span>
              )
            )}
          </div>
        )}
      </div>

      {votingOpen && !hasVoted && (
        <div className="border-t pt-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Your resonance (1-5):
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((weight) => (
                <button
                  key={weight}
                  onClick={() => setSelectedWeight(weight)}
                  className={`w-10 h-10 rounded-full font-bold transition-colors ${
                    selectedWeight === weight
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {weight}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Resonance tags (optional):
            </label>
            <div className="flex flex-wrap gap-2">
              {resonanceOptions.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleVote}
            disabled={isVoting}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isVoting ? 'Submitting...' : 'Cast Your Vote'}
          </button>
        </div>
      )}

      {hasVoted && (
        <div className="border-t pt-4">
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-lg text-center">
            Vote submitted successfully!
          </div>
        </div>
      )}

      {!votingOpen && (
        <div className="border-t pt-4">
          <div className="bg-gray-50 border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-center text-sm">
            Voting is closed
          </div>
        </div>
      )}
    </div>
  );
}
