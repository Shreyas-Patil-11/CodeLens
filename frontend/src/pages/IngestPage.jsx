import { Card, EmptyState, Spinner } from "../components/ui/index";
import { RobotMascot } from "../components/ui/RobotMascot";

function IngestSteps({ step }) {
  const steps = ["Cloning repo", "Parsing files", "Embedding chunks", "Building dependency graph", "Ready!"];
  return (
    <div className="flex flex-col gap-2 w-full max-w-xs mx-auto mt-4">
      {steps.map((s, i) => {
        const done   = i < step;
        const active = i === step;
        return (
          <div
            key={i}
            className={`flex items-center gap-3 transition-all duration-500 ${active ? "opacity-100 scale-105" : done ? "opacity-60" : "opacity-30"}`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all
              ${done ? "bg-emerald-400 text-white" : active ? "bg-indigo-500 text-white animate-pulse" : "bg-slate-200 text-slate-400"}`}>
              {done ? "✓" : i + 1}
            </div>
            <span className={`text-sm font-medium ${active ? "text-indigo-700" : done ? "text-emerald-700" : "text-slate-400"}`}>{s}</span>
            {active && <Spinner size={4} />}
          </div>
        );
      })}
    </div>
  );
}

export function IngestPage({ repoUrl, setRepoUrl, ingestStatus, ingestStep, ingestMsg, handleIngest, onDone }) {
  return (
    <div className="max-w-lg mx-auto fadein">
      <h1 className="text-3xl font-extrabold text-indigo-900 mb-1">Ingest Repository</h1>
      <p className="text-slate-500 text-sm mb-8">Paste a GitHub URL and let CodeLens analyze your entire codebase.</p>

      <Card className="p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full -translate-y-10 translate-x-10 opacity-40 pointer-events-none" />

        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          GitHub Repository URL
        </label>
        <div className="flex gap-2">
          <input
            className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50 font-mono"
            placeholder="https://github.com/user/repo"
            value={repoUrl}
            onChange={e => setRepoUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleIngest()}
          />
          <button
            onClick={handleIngest}
            disabled={ingestStatus === "loading"}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold text-sm shadow hover:shadow-lg hover:scale-[1.03] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {ingestStatus === "loading" ? <><Spinner size={4} /> Ingesting</> : "🚀 Ingest"}
          </button>
        </div>

        {ingestStatus === "loading" && (
          <div className="mt-6 fadein">
            <IngestSteps step={ingestStep} />
          </div>
        )}

        {ingestStatus === "done" && (
          <div className="mt-6 fadein flex flex-col items-center gap-3 py-4">
            <div className="text-5xl animate-bounce">🎉</div>
            <p className="font-bold text-emerald-700">Ingestion Complete!</p>
            <p className="text-xs text-slate-500">{ingestMsg}</p>
            <button
              onClick={onDone}
              className="mt-2 px-6 py-2 rounded-xl bg-emerald-500 text-white font-bold text-sm shadow hover:bg-emerald-600 transition"
            >
              Start Chatting →
            </button>
          </div>
        )}

        {ingestStatus === "error" && (
          <div className="mt-4 fadein bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            ❌ {ingestMsg}
          </div>
        )}
      </Card>

      {/* Feature tiles */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        {[
          { icon: "🤖", title: "Agentic AI Chat",    desc: "Multi-step reasoning over your code" },
          { icon: "🔍", title: "Semantic Search",     desc: "Find code by meaning, not keywords" },
          { icon: "🏛️", title: "Architecture Map",   desc: "Auto-generated Mermaid diagrams" },
          { icon: "📋", title: "Codebase Summary",   desc: "Tech stack & entry points at a glance" },
        ].map((f, i) => (
          <Card key={i} className="p-4 hover:shadow-md transition-shadow cursor-default">
            <span className="text-2xl">{f.icon}</span>
            <p className="font-bold text-slate-800 text-sm mt-2">{f.title}</p>
            <p className="text-xs text-slate-400 mt-0.5">{f.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
