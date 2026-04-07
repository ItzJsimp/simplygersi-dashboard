/**
 * Notion data layer for SimplyGersi Dashboard.
 *
 * Property-name matching is intentionally flexible — it tries several common
 * variations so you don't have to rename your Notion columns. If something
 * isn't showing up, check the console for "[notion]" errors and compare
 * the logged property names to the ones in findProp() calls below.
 */

import { Client } from '@notionhq/client';
import type { Deal, Task, Goal } from '@/types';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// ─────────────────────────────────────────────
// Low-level property helpers
// ─────────────────────────────────────────────

function findProp(props: Record<string, unknown>, ...names: string[]) {
  for (const n of names) if (props[n] !== undefined) return props[n] as any;
  return null;
}

function getText(prop: any): string {
  if (!prop) return '';
  if (prop.type === 'title') return (prop.title ?? []).map((t: any) => t.plain_text).join('');
  if (prop.type === 'rich_text') return (prop.rich_text ?? []).map((t: any) => t.plain_text).join('');
  return '';
}

function getSelect(prop: any): string {
  if (!prop) return '';
  if (prop.type === 'select') return prop.select?.name ?? '';
  if (prop.type === 'status') return prop.status?.name ?? '';
  if (prop.type === 'multi_select') return prop.multi_select?.[0]?.name ?? '';
  return '';
}

function getMultiSelect(prop: any): string[] {
  if (!prop) return [];
  if (prop.type === 'multi_select') return (prop.multi_select ?? []).map((s: any) => s.name);
  if (prop.type === 'select' && prop.select) return [prop.select.name];
  return [];
}

function getNumber(prop: any): number | null {
  if (!prop) return null;
  if (prop.type === 'number') return prop.number ?? null;
  if (prop.type === 'formula' && prop.formula?.type === 'number') return prop.formula.number ?? null;
  return null;
}

function getDate(prop: any): string | null {
  if (!prop) return null;
  if (prop.type === 'date') return prop.date?.start ?? null;
  if (prop.type === 'created_time') return (prop.created_time as string)?.split('T')[0] ?? null;
  if (prop.type === 'last_edited_time') return (prop.last_edited_time as string)?.split('T')[0] ?? null;
  return null;
}

function notConfigured(val: string | undefined): boolean {
  return !val || val.includes('[PASTE') || val.trim().length < 10;
}

// ─────────────────────────────────────────────
// Status classification sets
// ─────────────────────────────────────────────

const INACTIVE_DEAL = new Set([
  'won', 'lost', 'closed', 'cancelled', 'canceled',
  'complete', 'completed', 'archived', 'done',
]);

const DONE_TASK = new Set([
  'done', 'complete', 'completed', 'finished', 'closed', 'cancelled', 'canceled',
]);

const INACTIVE_GOAL = new Set([
  'done', 'complete', 'completed', 'archived', 'cancelled', 'canceled',
]);

// Keywords that classify a task as "content"
export const CONTENT_KEYWORDS = [
  'content', 'video', 'ugc', 'tiktok', 'creative',
  'filming', 'editing', 'reels', 'post', 'shoot',
];

// Priority sort order (lower = higher priority)
const PRIORITY_RANK: Record<string, number> = {
  urgent: 0, critical: 0,
  high: 1,
  medium: 2, normal: 2,
  low: 3,
};

// ─────────────────────────────────────────────
// Fetchers
// ─────────────────────────────────────────────

export async function fetchDeals(): Promise<Deal[]> {
  if (notConfigured(process.env.NOTION_DEALS_DB_ID)) return [];

  try {
    const res = await notion.databases.query({
      database_id: process.env.NOTION_DEALS_DB_ID!,
    });

    const deals: Deal[] = [];
    for (const page of res.results) {
      if (!('properties' in page)) continue;
      const props = page.properties as Record<string, any>;

      const status = getSelect(
        findProp(props, 'Status', 'Deal Status', 'Stage', 'Phase', 'State'),
      );
      if (INACTIVE_DEAL.has(status.toLowerCase())) continue;

      const name =
        getText(findProp(props, 'Name', 'Deal Name', 'Title', 'name')) || 'Untitled Deal';

      const brand =
        getText(findProp(props, 'Brand', 'Company', 'Client', 'Partner', 'Sponsor')) ||
        getSelect(findProp(props, 'Brand', 'Company', 'Client', 'Partner', 'Sponsor')) ||
        '—';

      const amount = getNumber(
        findProp(props, 'Amount', 'Rate', 'Fee', 'Value', 'Deal Value', 'Budget', 'Price', 'Total'),
      );

      const daysSinceUpdate = Math.floor(
        (Date.now() - new Date(page.last_edited_time).getTime()) / 86_400_000,
      );

      deals.push({
        id: page.id,
        name,
        brand,
        status: status || 'Active',
        amount,
        daysSinceUpdate,
        stalled: daysSinceUpdate >= 7,
        url: page.url,
      });
    }

    return deals.sort((a, b) => a.daysSinceUpdate - b.daysSinceUpdate);
  } catch (err) {
    console.error('[notion] fetchDeals:', err);
    return [];
  }
}

export async function fetchRevenue(): Promise<{ collected: number; totalInvoiced: number }> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split('T')[0];

  let collected = 0;
  let totalInvoiced = 0;

  // ── Payments received this month ─────────────────
  if (!notConfigured(process.env.NOTION_PAYMENTS_DB_ID)) {
    try {
      const res = await notion.databases.query({
        database_id: process.env.NOTION_PAYMENTS_DB_ID!,
      });
      for (const page of res.results) {
        if (!('properties' in page)) continue;
        const props = page.properties as Record<string, any>;

        // Try to get a date from a property; fall back to page created_time
        const dateStr =
          getDate(findProp(props, 'Date', 'Payment Date', 'Received Date', 'Received', 'Created')) ??
          (page as any).created_time?.split('T')[0];

        if (!dateStr || dateStr < startOfMonth) continue;

        const amount = getNumber(
          findProp(props, 'Amount', 'Total', 'Payment', 'Value', 'Revenue', 'Fee', 'Rate'),
        );
        if (amount) collected += amount;
      }
    } catch (err) {
      console.error('[notion] fetchPayments:', err);
    }
  }

  // ── Unpaid invoices ───────────────────────────────
  if (!notConfigured(process.env.NOTION_INVOICES_DB_ID)) {
    try {
      const res = await notion.databases.query({
        database_id: process.env.NOTION_INVOICES_DB_ID!,
      });
      for (const page of res.results) {
        if (!('properties' in page)) continue;
        const props = page.properties as Record<string, any>;
        const status = getSelect(
          findProp(props, 'Status', 'Invoice Status', 'Payment Status', 'State'),
        );
        const isPaid = ['paid', 'received', 'complete', 'completed', 'closed'].includes(
          status.toLowerCase(),
        );
        if (!isPaid) {
          const amount = getNumber(
            findProp(props, 'Amount', 'Total', 'Invoice Amount', 'Value', 'Fee'),
          );
          if (amount) totalInvoiced += amount;
        }
      }
    } catch (err) {
      console.error('[notion] fetchInvoices:', err);
    }
  }

  return { collected, totalInvoiced };
}

export async function fetchTasks(): Promise<Task[]> {
  if (notConfigured(process.env.NOTION_TASKS_DB_ID)) return [];

  try {
    const res = await notion.databases.query({
      database_id: process.env.NOTION_TASKS_DB_ID!,
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasks: Task[] = [];
    for (const page of res.results) {
      if (!('properties' in page)) continue;
      const props = page.properties as Record<string, any>;

      const status = getSelect(
        findProp(props, 'Status', 'Task Status', 'State', 'Stage', 'Progress'),
      );
      if (DONE_TASK.has(status.toLowerCase())) continue;

      const dueDateStr = getDate(
        findProp(props, 'Due Date', 'Due', 'Deadline', 'Date', 'Target Date'),
      );
      const isOverdue = dueDateStr
        ? new Date(dueDateStr + 'T23:59:59') < today
        : false;

      const areaProp = findProp(
        props,
        'Area', 'Category', 'Type', 'Section', 'Project', 'Tags', 'Tag',
      );
      const area = getSelect(areaProp) || getMultiSelect(areaProp).join(', ');
      const priority = getSelect(
        findProp(props, 'Priority', 'Urgency', 'Importance', 'P'),
      );

      tasks.push({
        id: page.id,
        name: getText(findProp(props, 'Name', 'Task', 'Title', 'name')) || 'Untitled',
        status: status || 'Not Started',
        priority,
        dueDate: dueDateStr,
        area,
        isOverdue,
        url: page.url,
      });
    }

    // Sort: overdue first → priority → due date
    tasks.sort((a, b) => {
      if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
      const pa = PRIORITY_RANK[a.priority.toLowerCase()] ?? 5;
      const pb = PRIORITY_RANK[b.priority.toLowerCase()] ?? 5;
      if (pa !== pb) return pa - pb;
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    });

    return tasks;
  } catch (err) {
    console.error('[notion] fetchTasks:', err);
    return [];
  }
}

export async function fetchGoals(): Promise<Goal[]> {
  if (notConfigured(process.env.NOTION_GOALS_DB_ID)) return [];

  try {
    const res = await notion.databases.query({
      database_id: process.env.NOTION_GOALS_DB_ID!,
    });

    const goals: Goal[] = [];
    for (const page of res.results) {
      if (!('properties' in page)) continue;
      const props = page.properties as Record<string, any>;

      const status = getSelect(findProp(props, 'Status', 'Goal Status', 'State', 'Stage'));
      if (INACTIVE_GOAL.has(status.toLowerCase())) continue;

      goals.push({
        id: page.id,
        name: getText(findProp(props, 'Name', 'Goal', 'Title', 'name')) || 'Untitled',
        status: status || 'Active',
        progress: getNumber(
          findProp(props, 'Progress', 'Completion', '%', 'Percent', 'Percentage'),
        ),
        url: page.url,
      });
    }

    return goals;
  } catch (err) {
    console.error('[notion] fetchGoals:', err);
    return [];
  }
}

export function filterContentTasks(tasks: Task[]): Task[] {
  return tasks.filter(t =>
    CONTENT_KEYWORDS.some(
      k =>
        t.area.toLowerCase().includes(k) ||
        t.name.toLowerCase().includes(k),
    ),
  );
}
