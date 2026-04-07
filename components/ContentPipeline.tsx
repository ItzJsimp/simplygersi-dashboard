import type { Task } from '@/types';

const STATUS_CHIP: Record<string, string> = {
  'not started': 'bg-slate-700/50 text-slate-400',
  'to do': 'bg-slate-700/50 text-slate-400',
  'in progress': 'bg-teal-500/15 text-teal-300',
  filming: 'bg-purple-500/15 text-purple-300',
  editing: 'bg-indigo-500/15 text-indigo-300',
  'in review': 'bg-blue-500/15 text-blue-300',
  review: 'bg-blue-500/15 text-blue-300',
  scheduled: 'bg-green-500/15 text-green-300',
  posted: 'bg-green-600/15 text-green-300',
};

function chip(status: string) {
  return STATUS_CHIP[status.toLowerCase()] ?? 'bg-slate-700/50 text-slate-400';
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

export default function ContentPipeline({ tasks }: { tasks: Task[] }) {
  return (
    <div className="rounded-xl bg-[#12121e] border border-[#1e1e30] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          Content Pipeline
        </h2>
        <span className="text-xs text-slate-600">{tasks.length} piece{tasks.length !== 1 ? 's' : ''}</span>
      </div>

      {tasks.length === 0 ? (
        <div className="text-slate-600 text-sm py-6 text-center leading-relaxed">
          No content tasks found.
          <br />
          <span className="text-xs text-slate-700">
            Tag a task with Area = &ldquo;Content&rdquo;, &ldquo;TikTok&rdquo;, &ldquo;UGC&rdquo;, or &ldquo;Video&rdquo; to see it here.
          </span>
        </div>
      ) : (
        <ul className="space-y-2">
          {tasks.map(task => {
            const dateInfo = task.dueDate ? relativeDate(task.dueDate) : null;
            return (
              <li
                key={task.id}
                className={`p-3 rounded-lg border ${
                  task.isOverdue
                    ? 'bg-red-950/25 border-red-900/40'
                    : 'bg-[#0f0f17] border-[#1e1e30] hover:border-teal-500/30'
                } group`}
              >
                <div className="flex items-start justify-between gap-2">
                  <a
                    href={task.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-sm font-medium leading-snug group-hover:text-teal-400 truncate flex-1 ${
                      task.isOverdue ? 'text-red-300' : 'text-slate-200'
                    }`}
                  >
                    {task.name}
                  </a>
                  <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${chip(task.status)}`}>
                    {task.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  {task.priority && (
                    <span className="text-[10px] text-slate-600">{task.priority} priority</span>
                  )}
                  {dateInfo && (
                    <span
                      className={`text-[10px] font-medium ${
                        dateInfo.overdue ? 'text-red-400' : 'text-slate-500'
                      }`}
                    >
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
