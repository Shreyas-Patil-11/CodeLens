import { RobotMascot } from "../ui/RobotMascot";
import { Badge } from "../ui/index";

function CodeRain() {
  const chars = "01{}[]()<>/\\|#$@;:,.!=*&^%~`abcdefABCDEF";
  const cols = 18;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.04]" aria-hidden>
      <div className="flex gap-3 h-full">
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col text-[10px] font-mono text-indigo-800 leading-4 select-none"
            style={{
              animation: `codefall ${2.5 + (i * 0.37) % 3}s linear infinite`,
              animationDelay: `${(i * 0.19) % 2.5}s`,
              opacity: 0.5 + (i % 3) * 0.15,
            }}
          >
            {Array.from({ length: 40 }).map((_, j) => (
              <span key={j}>{chars[(i * 7 + j * 13) % chars.length]}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
        ${active
          ? "bg-indigo-50 text-indigo-700 shadow-inner border border-indigo-100"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
      {badge && <Badge color="indigo">{badge}</Badge>}
    </button>
  );
}

export function Sidebar({ tab, setTab, collectionName, chatCount, isWorking }) {
  const nav = [
    { id: "ingest",  icon: "🚀", label: "Ingest Repo" },
    { id: "chat",    icon: "🤖", label: "AI Chat",      badge: chatCount || undefined },
    { id: "search",  icon: "🔍", label: "Code Search" },
    { id: "summary", icon: "📋", label: "Summary" },
    { id: "arch",    icon: "🏛️", label: "Architecture" },
    { id: "deps",    icon: "🕸️", label: "Dep Map" },
  ];

  return (
    <aside className="w-56 bg-white border-r border-slate-200 flex flex-col p-4 gap-1 shrink-0 relative overflow-hidden">
      <CodeRain />

      <div className="relative z-10 flex flex-col gap-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Navigation</p>
        {nav.map(n => (
          <NavItem
            key={n.id}
            icon={n.icon}
            label={n.label}
            active={tab === n.id}
            onClick={() => setTab(n.id)}
            badge={n.badge}
          />
        ))}
      </div>

      <div className="mt-auto relative z-10">
        <div className="flex justify-center">
          <RobotMascot state={isWorking ? "thinking" : collectionName ? "done" : "idle"} />
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-1">
          {isWorking ? "Working…" : collectionName ? "Repo loaded ✓" : "No repo loaded"}
        </p>
      </div>
    </aside>
  );
}
