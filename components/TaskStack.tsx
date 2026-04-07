import type { Task } from '@/types';

// Source: SimplyGersi Tasks database
// Shows all open tasks sorted: overdue → priority → due date

const PRIORITY_DOT: Record<string, string> = {
  urgent: 'text-red-500',
  critical: 'text-red-500',
  high: 'text-orange-400',
  medium: 'text-yellow-400',
  low: 'text-slate-600',
};

function dot(p: string) {
  return PRIORITY_DOT[p.toLowerCase()] ?? 'text-slate-700';
}

function relativeDate(d: string): { label: string; overdue: boolean } {
  const date = new Date(d + 'T12:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((date.getTime() - today.getTime()) / 86_400_000);
  if (diff < -1) return { label: `${Math.abs(diff)}d overdue`, overdue: true };
  if (diff === -1) return { label: 'Yesterday', overdue: true };
  if (diff === 0) return { label: 'Today', overdue: false };
  if (diff === 1) return { label: 'Tomorrow', overdue: false };
  return {
    label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    overdue: false,
  };
}

const MAX_SHOWN = 15;

export default function TaskStack({ tasks }: { tasks: Task[] }) {
  const shown = tasks.slice(0, MAX_SHOWN);
  const overdueCount = tasks.filter(t => t.isOverdue).length;

  return (
    <div className="rounded-xl bg-[#12121e] border border-[#1e1e30] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          Task Stack
        </h2>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-600">{tasks.length} open</span>
          {overdueCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/25">
              {overdueCount} overdue
            </span>
          )}
        </div>
      </div>

      {tasks.length === 0 ? (
        <p className="text-slate-600 text-sm py-6 text-center">
          No open tasks — or Notion not yet connected.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {shown.map(task => {
            const dateInfo = task.dueDate ? relativeDate(task.dueDate) : null;
            return (
              <li
                key={task.id}
                className={`flex items-start gap-2.5 px-2.5 py-2 rounded-lg ${
                  task.isOverdue
                    ? 'bg-red-950/30 border border-red-900/40'
                    : 'hover:bg-white/[0.02]'
                }`}
              >
                <span className={`mt-1 shrink-0 text-[10px] leading-none ${dot(task.priority)}`}>
                  ●
                </span>

                <div className="flex-1 min-w-0">
                  <a
                    href={task.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-sm font-medium leading-snug hover:underline block truncate ${
                      task.isOverdue ? 'text-red-300' : 'text-slate-200'
                    }`}
                  >
                    {task.name}
                  </a>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {task.status && (
                      <span className="text-[10px] text-slate-600">{task.status}</span>
                    )}
                    {task.priority && (
                      <span className={`text-[10px] ${dot(task.priority)}`}>{task.priority}</span>
                    )}
                    {task.area && (
                      <span className="text-[10px] text-slate-700">{task.area}</span>
                    )}
                    {task.relatedDeal && (
                      <span className="text-[10px] text-slate-700">↗ {task.relatedDeal}</span>
                    )}
                  </div>
                </div>

                {dateInfo && (
                  <span
                    className={`shrink-0 text-[11px] font-medium tabular-nums mt-0.5 ${
                      dateInfo.overdue ? 'text-red-400' : 'text-slate-500'
                    }`}
                  >
                    {dateInfo.label}
                  </span>
                )}
              </li>
            );
          })}

          {tasks.length > MAX_SHOWN && (
            <li className="text-xs text-slate-700 text-center py-1">
              +{tasks.length - MAX_SHOWN} more in Notion
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
