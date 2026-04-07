import type { Resource } from '@/types';

// Source: SimplyGersi Resources database
// Shows resources that haven't been processed / applied / archived.

const STATUS_CHIP: Record<string, string> = {
  'to review': 'bg-yellow-500/15 text-yellow-300',
  unreviewed: 'bg-yellow-500/15 text-yellow-300',
  saved: 'bg-slate-700/50 text-slate-400',
  reading: 'bg-teal-500/15 text-teal-300',
  'in progress': 'bg-teal-500/15 text-teal-300',
  starred: 'bg-orange-500/15 text-orange-300',
};

function chip(s: string) {
  return STATUS_CHIP[s.toLowerCase()] ?? 'bg-slate-700/50 text-slate-400';
}

export default function ResourcesInbox({ resources }: { resources: Resource[] }) {
  return (
    <div className="rounded-xl bg-[#12121e] border border-[#1e1e30] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          Resources Inbox
        </h2>
        <span className="text-xs text-slate-600">{resources.length} to review</span>
      </div>

      {resources.length === 0 ? (
        <div className="text-slate-600 text-sm py-6 text-center leading-relaxed">
          Nothing to review — or Notion not yet connected.
          <br />
          <span className="text-xs text-slate-700">
            Set <code className="font-mono">NOTION_RESOURCES_DB_ID</code> to connect SimplyGersi Resources.
          </span>
        </div>
      ) : (
        <ul className="space-y-1.5">
          {resources.map(resource => (
            <li key={resource.id}>
              <a
                href={resource.resourceUrl ?? resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 px-2.5 py-2 rounded-lg hover:bg-white/[0.02] group"
              >
                {/* Bookmark accent */}
                <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-orange-500/60" />

                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-slate-300 group-hover:text-teal-400 truncate block">
                    {resource.title}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${chip(resource.status)}`}>
                      {resource.status}
                    </span>
                    {resource.type && (
                      <span className="text-[10px] text-slate-700">{resource.type}</span>
                    )}
                    {resource.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[10px] text-slate-700">{tag}</span>
                    ))}
                  </div>
                </div>

                {resource.resourceUrl && (
                  <svg
                    className="shrink-0 w-3 h-3 mt-1 text-slate-700 group-hover:text-teal-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
