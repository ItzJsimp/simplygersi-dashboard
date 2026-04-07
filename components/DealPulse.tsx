import type { Deal } from '@/types';

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
  'in progress': 'bg-teal-500/15 text-teal-300 border-teal-500/30',
  pitched: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  outreach: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  sent: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  negotiating: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  'follow up': 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  interested: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  pending: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
};

function badgeClass(status: string) {
  return STATUS_BADGE[status.toLowerCase()] ?? 'bg-slate-500/15 text-slate-400 border-slate-500/30';
}

function daysAgoLabel(d: number) {
  if (d === 0) return 'today';
  if (d === 1) return '1 day ago';
  return `${d}d ago`;
}

export default function DealPulse({ deals }: { deals: Deal[] }) {
  const stalledCount = deals.filter(d => d.stalled).length;

  return (
    <div className="rounded-xl bg-[#12121e] border border-[#1e1e30] p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          Deal Pulse
        </h2>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-600">{deals.length} active</span>
          {stalledCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/25">
              {stalledCount} stalled
            </span>
          )}
        </div>
      </div>

      {deals.length === 0 ? (
        <p className="text-slate-600 text-sm py-6 text-center">
          No active deals — or Notion not yet connected.
        </p>
      ) : (
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="text-[11px] text-slate-600 border-b border-[#1e1e30]">
                <th className="text-left pb-2.5 pl-1 font-medium">Deal</th>
                <th className="text-left pb-2.5 font-medium hidden sm:table-cell">Brand</th>
                <th className="text-left pb-2.5 font-medium">Status</th>
                <th className="text-right pb-2.5 font-medium hidden md:table-cell">Amount</th>
                <th className="text-right pb-2.5 pr-1 font-medium">Last Edit</th>
              </tr>
            </thead>
            <tbody>
              {deals.map(deal => (
                <tr
                  key={deal.id}
                  className={`border-b border-[#191926] last:border-0 hover:bg-white/[0.015] ${
                    deal.stalled ? 'bg-orange-950/20' : ''
                  }`}
                >
                  <td className="py-2.5 pl-1 pr-3">
                    <a
                      href={deal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-slate-200 hover:text-teal-400 truncate max-w-[160px] block"
                    >
                      {deal.name}
                    </a>
                    {deal.stalled && (
                      <span className="text-[10px] text-orange-400 font-medium">⚠ stalled 7+ days</span>
                    )}
                  </td>
                  <td className="py-2.5 pr-3 text-slate-400 hidden sm:table-cell text-sm">
                    {deal.brand}
                  </td>
                  <td className="py-2.5 pr-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium border ${badgeClass(deal.status)}`}
                    >
                      {deal.status}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 text-right text-slate-400 hidden md:table-cell tabular-nums">
                    {deal.amount !== null ? usd(deal.amount) : '—'}
                  </td>
                  <td
                    className={`py-2.5 pr-1 text-right text-xs tabular-nums ${
                      deal.stalled ? 'text-orange-400 font-semibold' : 'text-slate-600'
                    }`}
                  >
                    {daysAgoLabel(deal.daysSinceUpdate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
