import { Badge } from "../ui/index";

export function Topbar({ collectionName }) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200 px-6 py-3 flex items-center gap-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
          <span className="text-white font-black text-lg logo">⌘</span>
        </div>
        <span className="text-xl font-extrabold tracking-tight text-indigo-900 logo">CodeLens</span>
        <Badge color="indigo">AI</Badge>
      </div>

      {collectionName && (
        <div className="ml-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
          <span className="text-xs font-semibold text-emerald-700 font-mono">{collectionName}</span>
        </div>
      )}

      <div className="ml-auto flex items-center gap-2 text-xs text-slate-400">
        <span>powered by</span>
        <span className="font-bold text-slate-600">Llama 3.1 · ChromaDB · LangChain</span>
      </div>
    </header>
  );
}
