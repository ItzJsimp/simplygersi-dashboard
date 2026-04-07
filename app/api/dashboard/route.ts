import { NextResponse } from 'next/server';
import {
  fetchDeals,
  fetchRevenue,
  fetchTasks,
  fetchGoals,
  fetchContentHub,
  fetchNotes,
  fetchResources,
  fetchThreadReviews,
} from '@/lib/notion';
import type { DashboardData } from '@/types';

// Never cache — always return fresh Notion data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const MONTHLY_GOAL = 5000;

export async function GET() {
  try {
    const [deals, revenue, tasks, goals, contentItems, notes, resources, threadReviews] =
      await Promise.all([
        fetchDeals(),
        fetchRevenue(),
        fetchTasks(),
        fetchGoals(),
        fetchContentHub(),
        fetchNotes(),
        fetchResources(),
        fetchThreadReviews(),
      ]);

    const data: DashboardData = {
      deals,
      revenue: {
        collected: revenue.collected,
        goal: MONTHLY_GOAL,
        totalInvoiced: revenue.totalInvoiced,
        overdueInvoiceCount: revenue.overdueInvoiceCount,
        activeDealsCount: deals.length,
      },
      tasks,
      contentItems,
      goals,
      notes,
      resources,
      threadReviews,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(data);
  } catch (err) {
    console.error('[api/dashboard] unhandled error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data. Check server logs.' },
      { status: 500 },
    );
  }
}
