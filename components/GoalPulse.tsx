import type { Goal } from '@/types';

// Source: SimplyGersi Goals database

const STATUS_CHIP: Record<string, string> = {
  active: 'bg-teal-500/15 text-teal-300 border-teal-500/25',
  'on track': 'bg-teal-500/15 text-teal-300 border-teal-500/25',
  'in progress': 'bg-teal-500/15 text-teal-300 border-teal-500/25',
  'at risk': 'bg-yellow-500/15 text-yellow-300 border-yellow-500/25',
  behind: 'bg-red-500/15 text-red-300 border-red-500/25',
  paused: 'bg-slate-500/15 text-slate-400 border-slate-500/25',
  'on hold': 'bg-slate-500/15 text-slate-400 border-slate-500/25',
};

function statusChip(s: string) {
  return STATUS_CHIP[s.toLowerCase()] ?? 'bg-slate-500/15 text-slate-400 border-slate-500/25';
}

function progressColor(p: number) {
  if (p >= 80) return 'from-teal-600 to-teal-300';
  if (p >= 50) return 'from-blue-600 to-teal-400';
  if (p >= 25) return 'from-yellow-600 to-teal-400';
  return 'from-slate-600 to-slate-400';
}

export default function GoalPulse({ goals }: { goals: Goal[] }) {
  // Surface first goal prominently (assumes sorted by relevance / creation order from Notion)
  const [primary, ...rest] = goals;

  return (
    <div className="rounded-xl bg-[#12121e] border border-[#1e1e30] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          Goal Pulse
        </h2>
        <span className="text-xs text-slate-600">{goals.length} active</span>
      </div>

      {goals.length === 0 ? (
        <p className="text-slate-600 text-sm py-6 text-center">
          No active goals — or Notion not yet connected.
        </p>
      ) : (
        <div className="space-y-3">
          {/* Primary goal — larger card */}
          {primary && (
            <a
              href={primary.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 rounded-lg bg-teal-500/5 border border-teal-500/20 hover:border-teal-500/40 group"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="text-sm font-semibold text-slate-100 group-hover:text-teal-400 leading-snug flex-1">
                  {primary.name}
                </span>
                <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full border font-medium ${statusChip(primary.status)}`}>
                  {primary.status}
                </span>
              </div>
              {primary.progress !== null ? (
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span>Progress</span>
                    <span className="tabular-nums font-semibold text-slate-300">{primary.progress}%</span>
                  </div>
                  <div className="h-2 bg-[#1e1e30] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${progressColor(primary.progress)}`}
                      style={{ width: `${Math.min(100, primary.progress)}%`, transition: 'width 0.8s ease' }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-[10px] text-slate-700">No progress tracked</div>
              )}
            </a>
          )}

          {/* Remaining goals — compact */}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {rest.map(goal => (
                <a
                  key={goal.id}
                  href={goal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-lg bg-[#0f0f17] border border-[#1e1e30] hover:border-teal-500/30 group block"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-medium text-slate-300 group-hover:text-teal-400 leading-snug flex-1">
                      {goal.name}
                    </span>
                    <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-full border ${statusChip(goal.status)}`}>
                      {goal.status}
                    </span>
                  </div>
                  {goal.progress !== null && (
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-600 mb-1">
                        <span>Progress</span>
                        <span className="tabular-nums">{goal.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-[#1e1e30] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${progressColor(goal.progress)}`}
                          style={{ width: `${Math.min(100, goal.progress)}%`, transition: 'width 0.8s ease' }}
                        />
                      </div>
                    </div>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
