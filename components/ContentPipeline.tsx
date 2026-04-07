import type { ContentItem } from '@/types';

// Source: SimplyGersi Content HUB database
// Shows all active content pieces with status, platform, type, due date, related deal.

const STATUS_CHIP: Record<string, string> = {
  'not started': 'bg-slate-700/50 text-slate-400',
  'to do': 'bg-slate-700/50 text-slate-400',
  planned: 'bg-slate-700/50 text-slate-400',
  'in progress': 'bg-teal-500/15 text-teal-300',
  filming: 'bg-purple-500/15 text-purple-300',
  recording: 'bg-purple-500/15 text-purple-300',
  editing: 'bg-indigo-500/15 text-indigo-300',
  'in review': 'bg-blue-500/15 text-blue-300',
  review: 'bg-blue-500/15 text-blue-300',
  ready: 'bg-green-500/15 text-green-300',
  scheduled: 'bg-green-500/15 text-green-300',
  blocked: 'bg-red-500/15 text-red-400',
};

function chip(s: string) {
  return STATUS_CHIP[s.toLowerCase()] ?? 'bg-slate-700/50 text-slate-400';
}

function relativeDate(d: string): { label: string; overdue: boolean } {
  const date = new Date(d + 'T12:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((date.getTime() - today.getTime()) / 86_400_000);
  if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, overdue: true };
  if (diff === 0) return { label: 'Due today', overdue: false };
  if (diff === 1) return { label: 'Due tomorrow', overdue: false };
  return {
    label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    overdue: false,
  };
}

export default function ContentPipeline({ items }: { items: ContentItem[] }) {
  const overdueCount = items.filter(i => i.isOverdue).length;

  return (
    <div className="rounded-xl bg-[#12121e] border border-[#1e1e30] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          Content Pipeline
        </h2>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-600">{items.length} piece{items.length !== 1 ? 's' : ''}</span>
          {overdueCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/25">
              {overdueCount} overdue
            </span>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-slate-600 text-sm py-6 text-center leading-relaxed">
          No active content found.
          <br />
          <span className="text-xs text-slate-700">
            Source: SimplyGersi Content HUB.{' '}
            Set <code className="font-mono">NOTION_CONTENT_DB_ID</code> in your env to connect it.
          </span>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map(item => {
            const dateInfo = item.dueDate ? relativeDate(item.dueDate) : null;
            return (
              <li
                key={item.id}
                className={`p-3 rounded-lg border group ${
                  item.isOverdue
                    ? 'bg-red-950/25 border-red-900/40'
                    : 'bg-[#0f0f17] border-[#1e1e30] hover:border-teal-500/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-sm font-medium leading-snug group-hover:text-teal-400 flex-1 truncate ${
                      item.isOverdue ? 'text-red-300' : 'text-slate-200'
                    }`}
                  >
                    {item.name}
                  </a>
                  <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${chip(item.status)}`}>
                    {item.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  {item.platform && (
                    <span className="text-[10px] text-teal-600 font-medium">{item.platform}</span>
                  )}
                  {item.type && (
                    <span className="text-[10px] text-slate-600">{item.type}</span>
                  )}
                  {item.relatedDeal && (
                    <span className="text-[10px] text-slate-700">↗ {item.relatedDeal}</span>
                  )}
                  {dateInfo && (
                    <span className={`text-[10px] font-medium ml-auto ${dateInfo.overdue ? 'text-red-400' : 'text-slate-500'}`}>
                      {dateInfo.label}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
