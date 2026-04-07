import type { ThreadReview } from '@/types';

// Source: AI Thread Reviews database
// Shows the most recent thread review summaries and flags missed tasks.
// Purpose: surface "what may have slipped" — the momentum accountability layer.

function relativeDate(d: string): string {
  const date = new Date(d + 'T12:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((date.getTime() - today.getTime()) / 86_400_000);
  if (diff === 0) return 'today';
  if (diff === -1) return 'yesterday';
  if (diff > -7) return `${Math.abs(diff)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ThreadPulse({ reviews }: { reviews: ThreadReview[] }) {
  const latest = reviews[0];
  const older = reviews.slice(1);

  return (
    <div className="rounded-xl bg-[#12121e] border border-[#1e1e30] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          Thread / Momentum Pulse
        </h2>
        <span className="text-xs text-slate-600">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
      </div>

      {reviews.length === 0 ? (
        <div className="text-slate-600 text-sm py-6 text-center leading-relaxed">
          No thread reviews found.
          <br />
          <span className="text-xs text-slate-700">
            Set <code className="font-mono">NOTION_THREAD_REVIEWS_DB_ID</code> to connect AI Thread Reviews.
          </span>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Latest review — expanded */}
          {latest && (
            <a
              href={latest.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3.5 rounded-lg bg-[#0f0f17] border border-[#1e1e30] hover:border-teal-500/30 group"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-slate-200 group-hover:text-teal-400 flex-1 truncate">
                  {latest.title}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  {latest.followUpNeeded && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/25">
                      follow-up
                    </span>
                  )}
                  {latest.date && (
                    <span className="text-[10px] text-slate-600 tabular-nums">
                      {relativeDate(latest.date)}
                    </span>
                  )}
                </div>
              </div>

              {latest.summary && (
                <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3 mb-2">
                  {latest.summary}
                </p>
              )}

              {latest.missedTasks && (
                <div className="rounded-md bg-orange-950/30 border border-orange-900/40 px-2.5 py-2">
                  <div className="text-[10px] font-semibold text-orange-400 mb-1">
                    Flagged / Missed Tasks
                  </div>
                  <p className="text-[11px] text-orange-300/80 leading-relaxed line-clamp-3">
                    {latest.missedTasks}
                  </p>
                </div>
              )}
            </a>
          )}

          {/* Older reviews — compact */}
          {older.map(review => (
            <a
              key={review.id}
              href={review.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-[#0f0f17] border border-[#1e1e30] hover:border-teal-500/20 group"
            >
              <span className="text-xs text-slate-500 group-hover:text-slate-300 truncate flex-1">
                {review.title}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                {review.followUpNeeded && (
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400" title="Follow-up needed" />
                )}
                {review.date && (
                  <span className="text-[10px] text-slate-700 tabular-nums">
                    {relativeDate(review.date)}
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
