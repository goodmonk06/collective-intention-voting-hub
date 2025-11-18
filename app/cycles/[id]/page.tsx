'use client';

import { use, useEffect, useState } from 'react';
import ProposalCard from '@/components/ProposalCard';
import Link from 'next/link';

interface Cycle {
  id: string;
  title: string;
  descriptionMarkdown: string;
  periodStart: string;
  periodEnd: string;
  proposalWindowOpen: boolean;
  votingWindowOpen: boolean;
}

interface Proposal {
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
}

export default function CyclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewProposal, setShowNewProposal] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch cycle
      const cycleRes = await fetch(`/api/cycles?active=false`);
      const cycles = await cycleRes.json();
      const currentCycle = cycles.find((c: Cycle) => c.id === id);
      setCycle(currentCycle || null);

      // Fetch proposals
      const proposalsRes = await fetch(`/api/cycles/${id}/proposals`);
      const proposalsData = await proposalsRes.json();
      setProposals(proposalsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (proposalId: string, weight: number, tags: string[]) => {
    const res = await fetch(`/api/proposals/${proposalId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        voterMemberId: `user-${Date.now()}`, // Simple user ID for demo
        weightScore: weight,
        resonanceTags: tags,
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to submit vote');
    }

    // Reload proposals to show updated stats
    await loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!cycle) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-red-600">Cycle not found</h1>
          <Link href="/" className="text-indigo-600 hover:underline mt-4 block">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-indigo-600 hover:underline mb-4 block">
          ← Back to home
        </Link>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h1 className="text-4xl font-bold mb-4">{cycle.title}</h1>
          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-wrap">
              {cycle.descriptionMarkdown}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">Period:</span>
              <span className="text-gray-600">
                {new Date(cycle.periodStart).toLocaleDateString()} -{' '}
                {new Date(cycle.periodEnd).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">Proposals:</span>
              <span
                className={`px-2 py-1 rounded ${
                  cycle.proposalWindowOpen
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {cycle.proposalWindowOpen ? 'Open' : 'Closed'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">Voting:</span>
              <span
                className={`px-2 py-1 rounded ${
                  cycle.votingWindowOpen
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {cycle.votingWindowOpen ? 'Open' : 'Closed'}
              </span>
            </div>
          </div>
        </div>

        {cycle.proposalWindowOpen && (
          <div className="mb-8">
            <button
              onClick={() => setShowNewProposal(!showNewProposal)}
              className="bg-indigo-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-indigo-700"
            >
              {showNewProposal ? 'Cancel' : '+ Submit New Proposal'}
            </button>

            {showNewProposal && (
              <NewProposalForm
                cycleId={id}
                onSuccess={() => {
                  setShowNewProposal(false);
                  loadData();
                }}
              />
            )}
          </div>
        )}

        <div className="mb-4">
          <h2 className="text-2xl font-bold">
            Proposals ({proposals.length})
          </h2>
        </div>

        <div className="grid gap-6">
          {proposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              onVote={handleVote}
              votingOpen={cycle.votingWindowOpen}
            />
          ))}
        </div>

        {proposals.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500">No proposals yet. Be the first to submit one!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function NewProposalForm({
  cycleId,
  onSuccess,
}: {
  cycleId: string;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/cycles/${cycleId}/proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          bodyMarkdown: body,
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
          proposerMemberId: `user-${Date.now()}`,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create proposal');
      }

      setTitle('');
      setBody('');
      setTags('');
      onSuccess();
    } catch (error) {
      console.error('Failed to create proposal:', error);
      alert('Failed to create proposal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mt-4">
      <h3 className="text-xl font-bold mb-4">Submit New Proposal</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter proposal title"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Description *</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Describe your intention proposal..."
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="e.g. community, growth, wellness"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {submitting ? 'Submitting...' : 'Submit Proposal'}
      </button>
    </form>
  );
}
