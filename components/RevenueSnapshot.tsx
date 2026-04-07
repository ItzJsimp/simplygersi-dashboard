import type { RevenueData } from '@/types';

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);

export default function RevenueSnapshot({ data }: { data: RevenueData }) {
  const pct = data.goal > 0 ? Math.min(100, Math.round((data.collected / data.goal) * 100)) : 0;
  const remaining = Math.max(0, data.goal - data.collected);

  const barColor =
    pct >= 100
      ? 'bg-green-400'
      : pct >= 70
      ? 'bg-gradient-to-r from-teal-500 to-teal-300'
      : pct >= 40
      ? 'bg-gradient-to-r from-yellow-500 to-teal-400'
      : 'bg-gradient-to-r from-slate-600 to-teal-500';

  const pctColor =
    pct >= 100 ? 'text-green-400' : pct >= 70 ? 'text-teal-400' : pct >= 40 ? 'text-yellow-400' : 'text-slate-400';

  return (
    <div className="rounded-xl bg-[#12121e] border border-[#1e1e30] p-5 h-full">
      <h2 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-4">
        Revenue Snapshot — {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}
      </h2>

      {/* Main stat */}
      <div className="flex items-end justify-between mb-2 flex-wrap gap-2">
        <div>
          <span className="text-4xl font-bold text-white tabular-nums">{usd(data.collected)}</span>
          <span className="text-slate-500 text-sm ml-2">collected</span>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500">Monthly goal</div>
          <div className="text-lg font-semibold text-slate-300">{usd(data.goal)}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-1">
        <div className="h-3 bg-[#1a1a2e] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${barColor}`}
            style={{ width: `${pct}%`, transition: 'width 0.8s ease' }}
          />
        </div>
      </div>
      <div className="flex justify-between items-center text-xs mb-5">
        <span className={`font-semibold tabular-nums ${pctColor}`}>{pct}%</span>
        <span className="text-slate-600">
          {pct >= 100 ? 'Goal reached! 🎉' : `${usd(remaining)} to go`}
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-[#0f0f17] border border-[#1e1e30] p-3">
          <div className="text-[11px] text-slate-500 mb-1">Invoiced (Unpaid)</div>
          <div className="text-xl font-semibold text-amber-400 tabular-nums">
            {usd(data.totalInvoiced)}
          </div>
          <div className="text-[10px] text-slate-600 mt-0.5">outstanding</div>
        </div>
        <div className="rounded-lg bg-[#0f0f17] border border-[#1e1e30] p-3">
          <div className="text-[11px] text-slate-500 mb-1">Active Deals</div>
          <div className="text-xl font-semibold text-teal-400 tabular-nums">
            {data.activeDealsCount}
          </div>
          <div className="text-[10px] text-slate-600 mt-0.5">in pipeline</div>
        </div>
      </div>
    </div>
  );
}
