'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Cycle {
  id: string;
  title: string;
  descriptionMarkdown: string;
  periodStart: string;
  periodEnd: string;
  proposalWindowOpen: boolean;
  votingWindowOpen: boolean;
  _count: {
    proposals: number;
  };
}

export default function Home() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);

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
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Collective Intention Voting Hub
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Community-driven intention and theme voting platform
          </p>
          <p className="text-gray-700 max-w-3xl">
            A space for communities to collectively decide on themes, intentions, and focus
            areas through resonance-based voting. Express not just approval, but the depth
            of your connection to each proposal.
          </p>
        </div>

        <div className="flex gap-4 mb-8">
          <Link
            href="/admin"
            className="bg-gray-800 text-white py-2 px-6 rounded-lg font-medium hover:bg-gray-900"
          >
            Admin Dashboard
          </Link>
        </div>

        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Intention Cycles</h2>
          <p className="text-gray-600">
            {cycles.length === 0
              ? 'No cycles yet. Create one from the admin dashboard!'
              : `${cycles.length} cycle${cycles.length !== 1 ? 's' : ''} available`}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {cycles.map((cycle) => {
            const now = new Date();
            const start = new Date(cycle.periodStart);
            const end = new Date(cycle.periodEnd);
            const isActive = now >= start && now <= end;

            return (
              <Link
                key={cycle.id}
                href={`/cycles/${cycle.id}`}
                className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold">{cycle.title}</h3>
                  {isActive && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      Active
                    </span>
                  )}
                </div>

                <p className="text-gray-700 mb-4 line-clamp-2">
                  {cycle.descriptionMarkdown}
                </p>

                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Period:</span>
                    <span className="text-gray-600">
                      {start.toLocaleDateString()} - {end.toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="font-medium">Proposals:</span>
                    <span className="text-gray-600">{cycle._count.proposals}</span>
                  </div>
                </div>

                <div className="flex gap-3 mt-4 text-sm">
                  <span
                    className={`px-2 py-1 rounded ${
                      cycle.proposalWindowOpen
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Proposals: {cycle.proposalWindowOpen ? 'Open' : 'Closed'}
                  </span>
                  <span
                    className={`px-2 py-1 rounded ${
                      cycle.votingWindowOpen
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Voting: {cycle.votingWindowOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {cycles.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 mb-4">
              No intention cycles yet. Get started by creating one!
            </p>
            <Link
              href="/admin"
              className="inline-block bg-indigo-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-indigo-700"
            >
              Go to Admin Dashboard
            </Link>
          </div>
        )}

        <footer className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-600">
          <p className="mb-2">
            Part of the collective intention ecosystem
          </p>
          <p className="text-sm">
            Connects with:{' '}
            <span className="font-medium">narrative-arc-campaign-designer</span> and{' '}
            <span className="font-medium">ritual-event-orchestrator</span>
          </p>
        </footer>
      </div>
    </main>
  );
}
