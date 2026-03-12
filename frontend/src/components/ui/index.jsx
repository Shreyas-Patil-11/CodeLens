// ─── Badge ────────────────────────────────────────────────────────────────
export function Badge({ children, color = "indigo" }) {
  const map = {
    indigo: "bg-indigo-100 text-indigo-700 border border-indigo-200",
    green:  "bg-emerald-100 text-emerald-700 border border-emerald-200",
    amber:  "bg-amber-100 text-amber-700 border border-amber-200",
    red:    "bg-red-100 text-red-700 border border-red-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[color]}`}>
      {children}
    </span>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────
export function Spinner({ size = 5 }) {
  return (
    <svg className={`animate-spin w-${size} h-${size} text-indigo-500`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────
export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────
export function EmptyState({ title, subtitle, icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <span className="text-6xl">{icon}</span>
      <div>
        <p className="text-lg font-bold text-slate-700">{title}</p>
        <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

// ─── TypingDots ───────────────────────────────────────────────────────────
export function TypingDots() {
  return (
    <span className="inline-flex gap-1 items-end h-4">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block"
          style={{ animation: `bounce 1s ease-in-out ${i * 0.18}s infinite` }}
        />
      ))}
    </span>
  );
}

// ─── FileChip ─────────────────────────────────────────────────────────────
export function FileChip({ path }) {
  const ext = path.split(".").pop();
  const colors = {
    py:   "bg-blue-50 text-blue-700 border-blue-200",
    js:   "bg-yellow-50 text-yellow-700 border-yellow-200",
    jsx:  "bg-cyan-50 text-cyan-700 border-cyan-200",
    ts:   "bg-sky-50 text-sky-700 border-sky-200",
    tsx:  "bg-violet-50 text-violet-700 border-violet-200",
    json: "bg-orange-50 text-orange-700 border-orange-200",
  };
  const c = colors[ext] || "bg-slate-50 text-slate-600 border-slate-200";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded border font-mono truncate max-w-[200px] ${c}`}
      title={path}
    >
      <span>📄</span>{path.split("/").slice(-2).join("/")}
    </span>
  );
}

// ─── MarkdownView ─────────────────────────────────────────────────────────
export function MarkdownView({ text }) {
  return (
    <div className="text-sm text-slate-700 leading-relaxed font-sans space-y-1">
      {text.split("\n").map((line, i) => {
        if (line.startsWith("### ")) return <h3 key={i} className="text-base font-bold text-indigo-800 mt-4 mb-1">{line.slice(4)}</h3>;
        if (line.startsWith("## "))  return <h2 key={i} className="text-lg font-bold text-indigo-900 mt-5 mb-1">{line.slice(3)}</h2>;
        if (line.startsWith("# "))   return <h1 key={i} className="text-xl font-extrabold text-indigo-900 mt-5 mb-2">{line.slice(2)}</h1>;
        if (line.startsWith("- ") || line.startsWith("* "))
          return <li key={i} className="ml-4 list-disc text-slate-600">{line.slice(2)}</li>;
        if (line.startsWith("```"))
          return <div key={i} className="bg-slate-900 text-emerald-300 rounded-lg px-3 py-1 text-xs font-mono my-1">{line.includes("mermaid") ? "⬡ Mermaid diagram" : "⎈ code block"}</div>;
        if (line === "") return <div key={i} className="h-2" />;
        return <p key={i}>{line}</p>;
      })}
    </div>
  );
}
