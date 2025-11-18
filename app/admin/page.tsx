'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Cycle {
  id: string;
  title: string;
  key: string;
  periodStart: string;
  periodEnd: string;
  proposalWindowOpen: boolean;
  votingWindowOpen: boolean;
  _count: {
    proposals: number;
  };
}

export default function AdminPage() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewCycle, setShowNewCycle] = useState(false);

  useEffect(() => {
    loadCycles();
  }, []);

  const loadCycles = async () => {
    try {
      const res = await fetch('/api/cycles');
      const data = await res.json();
      setCycles(data);
    } catch (error) {
      console.error('Failed to load cycles:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWindow = async (
    cycleId: string,
    field: 'proposalWindowOpen' | 'votingWindowOpen',
    currentValue: boolean
  ) => {
    try {
      const res = await fetch(`/api/cycles/${cycleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: !currentValue }),
      });

      if (res.ok) {
        await loadCycles();
      }
    } catch (error) {
      console.error('Failed to toggle window:', error);
    }
  };

  const selectOutcome = async (cycleId: string) => {
    if (!confirm('Are you sure you want to select the winning proposal? This will close both proposal and voting windows.')) {
      return;
    }

    try {
      const res = await fetch(`/api/cycles/${cycleId}/select-outcome`, {
        method: 'POST',
      });

      if (res.ok) {
        const outcome = await res.json();
        alert(`Outcome selected! Winning proposal: ${outcome.selectedProposal.title}`);
        await loadCycles();
      } else {
        const error = await res.json();
        alert(`Failed to select outcome: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to select outcome:', error);
      alert('Failed to select outcome');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-indigo-600 hover:underline mb-6 block">
          ← Back to home
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">
            Manage intention cycles, windows, and outcomes
          </p>
        </div>

        <div className="mb-8">
          <button
            onClick={() => setShowNewCycle(!showNewCycle)}
            className="bg-indigo-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-indigo-700"
          >
            {showNewCycle ? 'Cancel' : '+ Create New Cycle'}
          </button>

          {showNewCycle && (
            <NewCycleForm
              onSuccess={() => {
                setShowNewCycle(false);
                loadCycles();
              }}
            />
          )}
        </div>

        <div className="space-y-6">
          {cycles.map((cycle) => (
            <div
              key={cycle.id}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold">{cycle.title}</h3>
                  <p className="text-sm text-gray-500">Key: {cycle.key}</p>
                </div>
                <Link
                  href={`/cycles/${cycle.id}`}
                  className="text-indigo-600 hover:underline text-sm"
                >
                  View →
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Period Start</p>
                  <p className="font-medium">
                    {new Date(cycle.periodStart).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Period End</p>
                  <p className="font-medium">
                    {new Date(cycle.periodEnd).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Proposals</p>
                  <p className="font-medium">{cycle._count.proposals}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        toggleWindow(
                          cycle.id,
                          'proposalWindowOpen',
                          cycle.proposalWindowOpen
                        )
                      }
                      className={`px-2 py-1 text-xs rounded ${
                        cycle.proposalWindowOpen
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      P: {cycle.proposalWindowOpen ? 'Open' : 'Closed'}
                    </button>
                    <button
                      onClick={() =>
                        toggleWindow(
                          cycle.id,
                          'votingWindowOpen',
                          cycle.votingWindowOpen
                        )
                      }
                      className={`px-2 py-1 text-xs rounded ${
                        cycle.votingWindowOpen
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      V: {cycle.votingWindowOpen ? 'Open' : 'Closed'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => selectOutcome(cycle.id)}
                  className="bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-purple-700"
                >
                  Select Outcome
                </button>
                <Link
                  href={`/api/cycles/${cycle.id}/select-outcome`}
                  target="_blank"
                  className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-300"
                >
                  View Current Outcome
                </Link>
              </div>
            </div>
          ))}
        </div>

        {cycles.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500">No cycles yet. Create your first one above!</p>
          </div>
        )}
      </div>
    </main>
  );
}

function NewCycleForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    key: '',
    title: '',
    descriptionMarkdown: '',
    periodStart: '',
    periodEnd: '',
    proposalWindowOpen: true,
    votingWindowOpen: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/cycles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          periodStart: new Date(formData.periodStart).toISOString(),
          periodEnd: new Date(formData.periodEnd).toISOString(),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create cycle');
      }

      onSuccess();
    } catch (error) {
      console.error('Failed to create cycle:', error);
      alert('Failed to create cycle. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mt-4">
      <h3 className="text-xl font-bold mb-4">Create New Cycle</h3>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">Key (unique) *</label>
          <input
            type="text"
            value={formData.key}
            onChange={(e) => setFormData({ ...formData, key: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. apr-2026"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. April 2026: Theme Voting"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Description *</label>
        <textarea
          value={formData.descriptionMarkdown}
          onChange={(e) =>
            setFormData({ ...formData, descriptionMarkdown: e.target.value })
          }
          required
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Describe the purpose of this cycle..."
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">Period Start *</label>
          <input
            type="date"
            value={formData.periodStart}
            onChange={(e) =>
              setFormData({ ...formData, periodStart: e.target.value })
            }
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Period End *</label>
          <input
            type="date"
            value={formData.periodEnd}
            onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.proposalWindowOpen}
            onChange={(e) =>
              setFormData({ ...formData, proposalWindowOpen: e.target.checked })
            }
            className="w-4 h-4 text-indigo-600"
          />
          <span className="text-sm">Proposal window open</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.votingWindowOpen}
            onChange={(e) =>
              setFormData({ ...formData, votingWindowOpen: e.target.checked })
            }
            className="w-4 h-4 text-indigo-600"
          />
          <span className="text-sm">Voting window open</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {submitting ? 'Creating...' : 'Create Cycle'}
      </button>
    </form>
  );
}
