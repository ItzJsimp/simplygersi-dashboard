/**
 * Notion data layer for SimplyGersi Dashboard.
 *
 * Property-name matching is intentionally flexible — it tries several common
 * variations so you don't have to rename your Notion columns.
 *
 * If a section shows empty data when it shouldn't, check the Vercel Function
 * logs (or `npm run dev` terminal) for "[notion]" error lines. They will show
 * the exact property names Notion returned so you can add them to the
 * findProp() calls below.
 *
 * v1 source set:
 *   TIER 1: Tasks, Deal HUB, Goals, Invoices, Payments Received, Content HUB
 *   TIER 2: Notes, Resources, AI Thread Reviews
 *   PHASE 2 (not built): Brand Outreach
 */

import { Client } from '@notionhq/client';
import type { Deal, Task, Goal, ContentItem, Note, Resource, ThreadReview } from '@/types';

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

function getUrl(prop: any): string | null {
  if (!prop) return null;
  if (prop.type === 'url') return prop.url ?? null;
  if (prop.type === 'rich_text') return getText(prop) || null;
  return null;
}

function getCheckbox(prop: any): boolean {
  if (!prop) return false;
  if (prop.type === 'checkbox') return prop.checkbox ?? false;
  return false;
}

function notConfigured(val: string | undefined): boolean {
  if (!val || val.trim().length < 10) return true;
  if (val.includes('[PASTE')) return true;
  // Detect placeholder patterns: all-x strings like "xxxxxxxx..." or "secret_xxx..."
  const core = val.replace(/^secret_/, '').replace(/-/g, '');
  if (/^(.)\1{6,}$/.test(core)) return true; // same char repeated 7+ times
  return false;
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

const DONE_CONTENT = new Set([
  'posted', 'published', 'done', 'complete', 'completed', 'archived', 'cancelled', 'canceled',
]);

const PROCESSED_NOTE = new Set([
  'processed', 'done', 'complete', 'completed', 'archived', 'filed',
]);

const PROCESSED_RESOURCE = new Set([
  'done', 'applied', 'archived', 'used', 'complete', 'completed', 'filed',
]);

// Priority sort order (lower = higher priority)
const PRIORITY_RANK: Record<string, number> = {
  urgent: 0, critical: 0,
  high: 1,
  medium: 2, normal: 2,
  low: 3,
};

// ─────────────────────────────────────────────
// TIER 1 Fetchers
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

      const brand =
        getText(findProp(props, 'Brand', 'Company', 'Client', 'Partner', 'Sponsor')) ||
        getSelect(findProp(props, 'Brand', 'Company', 'Client', 'Partner', 'Sponsor')) ||
        '—';

      const amount = getNumber(
        findProp(props, 'Expected Deal Amount', 'Amount', 'Rate', 'Fee', 'Value', 'Deal Value', 'Budget', 'Price', 'Total'),
      );

      const daysSinceUpdate = Math.floor(
        (Date.now() - new Date((page as any).last_edited_time).getTime()) / 86_400_000,
      );

      deals.push({
        id: page.id,
        name: getText(findProp(props, 'Name', 'Deal Name', 'Title', 'name')) || 'Untitled Deal',
        brand,
        status: status || 'Active',
        amount,
        daysSinceUpdate,
        stalled: daysSinceUpdate >= 7,
        url: (page as any).url,
      });
    }

    return deals.sort((a, b) => a.daysSinceUpdate - b.daysSinceUpdate);
  } catch (err) {
    console.error('[notion] fetchDeals:', err);
    return [];
  }
}

export async function fetchRevenue(): Promise<{
  collected: number;
  totalInvoiced: number;
  overdueInvoiceCount: number;
}> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split('T')[0];
  const todayStr = now.toISOString().split('T')[0];

  let collected = 0;
  let totalInvoiced = 0;
  let overdueInvoiceCount = 0;

  // ── Payments received this month ─────────────────
  if (!notConfigured(process.env.NOTION_PAYMENTS_DB_ID)) {
    try {
      const res = await notion.databases.query({
        database_id: process.env.NOTION_PAYMENTS_DB_ID!,
      });
      for (const page of res.results) {
        if (!('properties' in page)) continue;
        const props = page.properties as Record<string, any>;

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

  // ── Invoices: unpaid total + overdue count ────────
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

          const dueDate = getDate(findProp(props, 'Due Date', 'Due', 'Deadline', 'Date'));
          if (dueDate && dueDate < todayStr) overdueInvoiceCount++;
        }
      }
    } catch (err) {
      console.error('[notion] fetchInvoices:', err);
    }
  }

  return { collected, totalInvoiced, overdueInvoiceCount };
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
      const isOverdue = dueDateStr ? new Date(dueDateStr + 'T23:59:59') < today : false;

      const areaProp = findProp(props, 'Area', 'Category', 'Type', 'Section', 'Project', 'Tags', 'Tag');
      const area = getSelect(areaProp) || getMultiSelect(areaProp).join(', ');
      const priority = getSelect(findProp(props, 'Priority', 'Urgency', 'Importance', 'P'));
      const relatedDeal =
        getText(findProp(props, 'Deal', 'Related Deal', 'Brand', 'Client', 'Partner')) ||
        getSelect(findProp(props, 'Deal', 'Related Deal', 'Brand', 'Client', 'Partner')) ||
        '';

      tasks.push({
        id: page.id,
        name: getText(findProp(props, 'Name', 'Task', 'Title', 'name')) || 'Untitled',
        status: status || 'Not Started',
        priority,
        dueDate: dueDateStr,
        area,
        relatedDeal,
        isOverdue,
        url: (page as any).url,
      });
    }

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
        progress: getNumber(findProp(props, 'Progress', 'Completion', '%', 'Percent', 'Percentage')),
        url: (page as any).url,
      });
    }

    return goals;
  } catch (err) {
    console.error('[notion] fetchGoals:', err);
    return [];
  }
}

export async function fetchContentHub(): Promise<ContentItem[]> {
  if (notConfigured(process.env.NOTION_CONTENT_DB_ID)) return [];

  try {
    const res = await notion.databases.query({
      database_id: process.env.NOTION_CONTENT_DB_ID!,
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const items: ContentItem[] = [];
    for (const page of res.results) {
      if (!('properties' in page)) continue;
      const props = page.properties as Record<string, any>;

      const status = getSelect(findProp(props, 'Status', 'Content Status', 'State', 'Stage', 'Phase'));
      if (DONE_CONTENT.has(status.toLowerCase())) continue;

      const dueDateStr = getDate(
        findProp(props, 'Due Date', 'Due', 'Publish Date', 'Deadline', 'Date', 'Scheduled Date'),
      );
      const isOverdue = dueDateStr ? new Date(dueDateStr + 'T23:59:59') < today : false;

      const platformProp = findProp(props, 'Platform', 'Channel', 'Social', 'Network', 'Platforms');
      const platform = getSelect(platformProp) || getMultiSelect(platformProp).join(', ');
      const typeProp = findProp(props, 'Type', 'Content Type', 'Format', 'Category', 'Style');
      const type = getSelect(typeProp) || getMultiSelect(typeProp).join(', ');
      const relatedDeal =
        getText(findProp(props, 'Deal', 'Related Deal', 'Brand', 'Client', 'Partner', 'Campaign')) ||
        getSelect(findProp(props, 'Deal', 'Related Deal', 'Brand', 'Client', 'Partner', 'Campaign')) ||
        '';

      items.push({
        id: page.id,
        name: getText(findProp(props, 'Name', 'Content', 'Title', 'name')) || 'Untitled',
        status: status || 'Not Started',
        platform,
        type,
        dueDate: dueDateStr,
        relatedDeal,
        isOverdue,
        url: (page as any).url,
      });
    }

    items.sort((a, b) => {
      if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    });

    return items;
  } catch (err) {
    console.error('[notion] fetchContentHub:', err);
    return [];
  }
}

// ─────────────────────────────────────────────
// TIER 2 Fetchers
// ─────────────────────────────────────────────

export async function fetchNotes(): Promise<Note[]> {
  if (notConfigured(process.env.NOTION_NOTES_DB_ID)) return [];

  try {
    const res = await notion.databases.query({
      database_id: process.env.NOTION_NOTES_DB_ID!,
      sorts: [{ timestamp: 'created_time', direction: 'descending' }],
    });

    const notes: Note[] = [];
    for (const page of res.results) {
      if (!('properties' in page)) continue;
      const props = page.properties as Record<string, any>;

      const status = getSelect(findProp(props, 'Status', 'State', 'Stage', 'Type', 'Category'));
      if (status && PROCESSED_NOTE.has(status.toLowerCase())) continue;

      notes.push({
        id: page.id,
        title: getText(findProp(props, 'Name', 'Title', 'Note', 'name')) || 'Untitled Note',
        status: status || 'Inbox',
        createdDate: (page as any).created_time?.split('T')[0] ?? null,
        tags: getMultiSelect(findProp(props, 'Tags', 'Tag', 'Category', 'Type', 'Labels', 'Area')),
        url: (page as any).url,
      });

      if (notes.length >= 8) break;
    }

    return notes;
  } catch (err) {
    console.error('[notion] fetchNotes:', err);
    return [];
  }
}

export async function fetchResources(): Promise<Resource[]> {
  if (notConfigured(process.env.NOTION_RESOURCES_DB_ID)) return [];

  try {
    const res = await notion.databases.query({
      database_id: process.env.NOTION_RESOURCES_DB_ID!,
      sorts: [{ timestamp: 'created_time', direction: 'descending' }],
    });

    const resources: Resource[] = [];
    for (const page of res.results) {
      if (!('properties' in page)) continue;
      const props = page.properties as Record<string, any>;

      const status = getSelect(findProp(props, 'Status', 'State', 'Stage'));
      if (status && PROCESSED_RESOURCE.has(status.toLowerCase())) continue;

      resources.push({
        id: page.id,
        title: getText(findProp(props, 'Name', 'Title', 'Resource', 'name')) || 'Untitled',
        resourceUrl: getUrl(findProp(props, 'URL', 'Link', 'Source', 'Url', 'url')),
        status: status || 'To Review',
        tags: getMultiSelect(findProp(props, 'Tags', 'Tag', 'Category', 'Labels', 'Area')),
        type: getSelect(findProp(props, 'Type', 'Category', 'Format', 'Kind')),
        url: (page as any).url,
      });

      if (resources.length >= 8) break;
    }

    return resources;
  } catch (err) {
    console.error('[notion] fetchResources:', err);
    return [];
  }
}

export async function fetchThreadReviews(): Promise<ThreadReview[]> {
  if (notConfigured(process.env.NOTION_THREAD_REVIEWS_DB_ID)) return [];

  try {
    const res = await notion.databases.query({
      database_id: process.env.NOTION_THREAD_REVIEWS_DB_ID!,
      sorts: [{ timestamp: 'created_time', direction: 'descending' }],
    });

    const reviews: ThreadReview[] = [];
    for (const page of res.results) {
      if (!('properties' in page)) continue;
      const props = page.properties as Record<string, any>;

      const summary = getText(
        findProp(props, 'Notes', 'Summary', 'Review', 'Content', 'Body', 'Output'),
      );

      // Actual schema: numeric counts
      const missedCount = getNumber(findProp(props, 'Missed Tasks Flagged', 'Missed Tasks', 'Flagged Tasks')) ?? 0;
      const threadsFollowUp = getNumber(findProp(props, 'Threads Needing Follow-Up', 'Follow-Up Threads', 'Follow Up Threads')) ?? 0;

      const missedTasks =
        missedCount > 0 || threadsFollowUp > 0
          ? [
              missedCount > 0 ? `${missedCount} missed task${missedCount !== 1 ? 's' : ''} flagged` : '',
              threadsFollowUp > 0 ? `${threadsFollowUp} thread${threadsFollowUp !== 1 ? 's' : ''} needing follow-up` : '',
            ]
              .filter(Boolean)
              .join(' · ')
          : '';

      const followUpNeeded = threadsFollowUp > 0 || missedCount > 0;

      reviews.push({
        id: page.id,
        title:
          getText(findProp(props, 'Run Name', 'Name', 'Title', 'Thread', 'Review', 'name')) || 'Thread Review',
        date:
          getDate(findProp(props, 'Run Date', 'Date', 'Review Date', 'Created', 'Week')) ??
          (page as any).created_time?.split('T')[0] ??
          null,
        summary,
        missedTasks,
        followUpNeeded,
        url: (page as any).url,
      });

      if (reviews.length >= 4) break; // show most recent reviews
    }

    return reviews;
  } catch (err) {
    console.error('[notion] fetchThreadReviews:', err);
    return [];
  }
}
