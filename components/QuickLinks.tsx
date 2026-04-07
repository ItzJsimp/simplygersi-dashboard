const LINKS = [
  {
    label: 'Command Center',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    envKey: 'NEXT_PUBLIC_LINK_COMMAND_CENTER',
    fallback: 'https://notion.so',
    accent: 'hover:border-teal-500/50 hover:text-teal-400 hover:bg-teal-500/5',
  },
  {
    label: 'Deal HUB',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    envKey: 'NEXT_PUBLIC_LINK_DEAL_HUB',
    fallback: 'https://notion.so',
    accent: 'hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-500/5',
  },
  {
    label: 'Tasks',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    envKey: 'NEXT_PUBLIC_LINK_TASKS',
    fallback: 'https://notion.so',
    accent: 'hover:border-purple-500/50 hover:text-purple-400 hover:bg-purple-500/5',
  },
  {
    label: 'Invoices',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    envKey: 'NEXT_PUBLIC_LINK_INVOICES',
    fallback: 'https://notion.so',
    accent: 'hover:border-green-500/50 hover:text-green-400 hover:bg-green-500/5',
  },
] as const;

export default function QuickLinks() {
  return (
    <div className="rounded-xl bg-[#12121e] border border-[#1e1e30] p-5 h-full">
      <h2 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-4">
        Quick Links
      </h2>
      <div className="grid grid-cols-2 gap-2 h-[calc(100%-2rem)]">
        {LINKS.map(link => {
          // NEXT_PUBLIC_ vars are inlined at build time
          const href =
            (process.env[link.envKey] as string | undefined) ?? link.fallback;

          return (
            <a
              key={link.label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-[#0f0f17] border border-[#1e1e30] text-slate-500 ${link.accent} group`}
            >
              <span className="group-hover:scale-110 transition-transform">{link.icon}</span>
              <span className="text-[11px] font-medium text-center leading-tight">{link.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
