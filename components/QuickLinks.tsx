// Quick Links panel — 8 buttons linking to key Notion pages.
// URLs are set via NEXT_PUBLIC_LINK_* environment variables.
// They are inlined at build time by Next.js — no server round-trip needed.

const LINKS = [
  {
    label: 'Command Center',
    envKey: 'NEXT_PUBLIC_LINK_COMMAND_CENTER',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    accent: 'hover:border-teal-500/50 hover:text-teal-300 hover:bg-teal-500/5',
  },
  {
    label: 'SG Hub',
    envKey: 'NEXT_PUBLIC_LINK_HUB',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
    accent: 'hover:border-slate-500/50 hover:text-slate-300 hover:bg-slate-500/5',
  },
  {
    label: 'Deal HUB',
    envKey: 'NEXT_PUBLIC_LINK_DEAL_HUB',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    accent: 'hover:border-blue-500/50 hover:text-blue-300 hover:bg-blue-500/5',
  },
  {
    label: 'Tasks',
    envKey: 'NEXT_PUBLIC_LINK_TASKS',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    accent: 'hover:border-purple-500/50 hover:text-purple-300 hover:bg-purple-500/5',
  },
  {
    label: 'Content HUB',
    envKey: 'NEXT_PUBLIC_LINK_CONTENT_HUB',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    accent: 'hover:border-pink-500/50 hover:text-pink-300 hover:bg-pink-500/5',
  },
  {
    label: 'Notes',
    envKey: 'NEXT_PUBLIC_LINK_NOTES',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    ),
    accent: 'hover:border-yellow-500/50 hover:text-yellow-300 hover:bg-yellow-500/5',
  },
  {
    label: 'Resources',
    envKey: 'NEXT_PUBLIC_LINK_RESOURCES',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
      </svg>
    ),
    accent: 'hover:border-orange-500/50 hover:text-orange-300 hover:bg-orange-500/5',
  },
  {
    label: 'Invoices',
    envKey: 'NEXT_PUBLIC_LINK_INVOICES',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    accent: 'hover:border-green-500/50 hover:text-green-300 hover:bg-green-500/5',
  },
] as const;

export default function QuickLinks() {
  return (
    <div className="rounded-xl bg-[#12121e] border border-[#1e1e30] p-5 h-full">
      <h2 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-3">
        Quick Links
      </h2>
      <div className="grid grid-cols-2 gap-1.5">
        {LINKS.map(link => {
          const href = (process.env[link.envKey] as string | undefined) ?? 'https://notion.so';
          return (
            <a
              key={link.label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 px-2.5 py-2 rounded-lg bg-[#0f0f17] border border-[#1e1e30] text-slate-600 text-xs font-medium group ${link.accent}`}
            >
              <span className="shrink-0 group-hover:scale-110 transition-transform">{link.icon}</span>
              <span className="truncate">{link.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
