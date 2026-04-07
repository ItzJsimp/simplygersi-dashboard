import type { Note } from '@/types';

// Source: SimplyGersi Notes database
// Shows unprocessed / inbox notes sorted newest-first.
// Once a note has Status = "Processed", "Archived", etc. it drops off.

const STATUS_CHIP: Record<string, string> = {
  inbox: 'bg-yellow-500/15 text-yellow-300',
  new: 'bg-yellow-500/15 text-yellow-300',
  'to process': 'bg-orange-500/15 text-orange-300',
  'in progress': 'bg-teal-500/15 text-teal-300',
  saved: 'bg-slate-700/50 text-slate-400',
};

function chip(s: string) {
  return STATUS_CHIP[s.toLowerCase()] ?? 'bg-slate-700/50 text-slate-400';
}

function relativeCreated(d: string): string {
  const date = new Date(d);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86_400_000);
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function NotesInbox({ notes }: { notes: Note[] }) {
  return (
    <div className="rounded-xl bg-[#12121e] border border-[#1e1e30] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          Notes Inbox
        </h2>
        <span className="text-xs text-slate-600">{notes.length} unprocessed</span>
      </div>

      {notes.length === 0 ? (
        <div className="text-slate-600 text-sm py-6 text-center leading-relaxed">
          Inbox clear — or Notion not yet connected.
          <br />
          <span className="text-xs text-slate-700">
            Set <code className="font-mono">NOTION_NOTES_DB_ID</code> to connect SimplyGersi Notes.
          </span>
        </div>
      ) : (
        <ul className="space-y-1.5">
          {notes.map(note => (
            <li key={note.id}>
              <a
                href={note.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 px-2.5 py-2 rounded-lg hover:bg-white/[0.02] group"
              >
                {/* Yellow left accent for inbox items */}
                <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-yellow-500/60" />

                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-slate-300 group-hover:text-teal-400 truncate block">
                    {note.title}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${chip(note.status)}`}>
                      {note.status}
                    </span>
                    {note.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[10px] text-slate-700">{tag}</span>
                    ))}
                  </div>
                </div>

                {note.createdDate && (
                  <span className="shrink-0 text-[10px] text-slate-600 mt-1 tabular-nums">
                    {relativeCreated(note.createdDate)}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
