'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DashboardData } from '@/types';
import RevenueSnapshot from '@/components/RevenueSnapshot';
import DealPulse from '@/components/DealPulse';
import TaskStack from '@/components/TaskStack';
import ContentPipeline from '@/components/ContentPipeline';
import GoalPulse from '@/components/GoalPulse';
import NotesInbox from '@/components/NotesInbox';
import ResourcesInbox from '@/components/ResourcesInbox';
import ThreadPulse from '@/components/ThreadPulse';
import QuickLinks from '@/components/QuickLinks';

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}

function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-52 rounded-xl bg-[#12121e] border border-[#1e1e30] animate-pulse" />
        <div className="h-52 rounded-xl bg-[#12121e] border border-[#1e1e30] animate-pulse" />
      </div>
      <div className="h-44 rounded-xl bg-[#12121e] border border-[#1e1e30] animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 rounded-xl bg-[#12121e] border border-[#1e1e30] animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard', { cache: 'no-store' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const json: DashboardData = await res.json();
      setData(json);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formattedTime = data
    ? new Date(data.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="min-h-screen bg-[#0f0f17]">
      {/* ── Header ──────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-[#1e1e30] bg-[#0d0d15]/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shrink-0">
              <span className="text-teal-400 text-xs font-bold">SG</span>
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight leading-none">
                <span className="text-teal-400">Simply</span>
                <span className="text-white">Gersi</span>
              </h1>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-none">
                {loading ? 'Refreshing…' : formattedTime ? `Updated ${formattedTime}` : 'Dashboard'}
              </p>
            </div>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-400 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshIcon spinning={loading} />
            {loading ? 'Refreshing' : 'Refresh'}
          </button>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-4">
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <strong>Error:</strong> {error}
            <p className="text-xs text-red-500 mt-1">
              Check that your Notion API key and database IDs are in{' '}
              <code className="font-mono">.env.local</code> and each database has the integration
              connected.
            </p>
          </div>
        )}

        {loading && !data && <Skeleton />}

        {data && (
          <>
            {/* Row 1: Revenue (2/3) + Quick Links (1/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <RevenueSnapshot data={data.revenue} />
              </div>
              <QuickLinks />
            </div>

            {/* Row 2: Deal Pulse — full width */}
            <DealPulse deals={data.deals} />

            {/* Row 3: Task Stack + Content Pipeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TaskStack tasks={data.tasks} />
              <ContentPipeline items={data.contentItems} />
            </div>

            {/* Row 4: Goal Pulse + Thread / Momentum Pulse */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <GoalPulse goals={data.goals} />
              <ThreadPulse reviews={data.threadReviews} />
            </div>

            {/* Row 5: Notes Inbox + Resources Inbox */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <NotesInbox notes={data.notes} />
              <ResourcesInbox resources={data.resources} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
