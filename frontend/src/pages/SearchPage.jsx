import { useState } from "react";
import { Card, Spinner, FileChip, EmptyState } from "../components/ui/index";

function SearchResultCard({ result, index }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="overflow-hidden transition-all duration-300">
      <button
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50"
        onClick={() => setOpen(!open)}
      >
        <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
          {index + 1}
        </span>
        <FileChip path={result.file_path} />
        <span className="ml-auto text-slate-400 text-xs">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="border-t border-slate-100 bg-slate-950 p-4 overflow-x-auto">
          <pre className="text-xs text-emerald-300 font-mono whitespace-pre-wrap leading-5">{result.snippet}</pre>
        </div>
      )}
    </Card>
  );
}

export function SearchPage({ collectionName, searchQuery, setSearchQuery, searchResults, searchLoading, handleSearch }) {
  return (
    <div className="max-w-2xl mx-auto fadein">
      <h1 className="text-2xl font-extrabold text-indigo-900 mb-1">Semantic Code Search</h1>
      <p className="text-slate-500 text-sm mb-6">Search your codebase by concept or meaning — no exact matches needed.</p>

      {!collectionName ? (
        <EmptyState icon="🔍" title="No repo loaded" subtitle="Ingest a repository first" />
      ) : (
        <>
          <div className="flex gap-2 mb-6">
            <input
              className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white font-mono"
              placeholder="e.g. user authentication logic"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={searchLoading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold text-sm shadow hover:shadow-lg transition disabled:opacity-60 flex items-center gap-2"
            >
              {searchLoading ? <><Spinner size={4} /> Searching</> : "🔍 Search"}
            </button>
          </div>

          {searchLoading && (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-2xl shimmer" />)}
            </div>
          )}

          {!searchLoading && searchResults.length > 0 && (
            <div className="flex flex-col gap-3 fadein">
              <p className="text-xs text-slate-400 font-semibold">{searchResults.length} results</p>
              {searchResults.map((r, i) => <SearchResultCard key={i} result={r} index={i} />)}
            </div>
          )}

          {!searchLoading && searchResults.length === 0 && searchQuery && (
            <EmptyState icon="📭" title="No results found" subtitle="Try a different query" />
          )}
        </>
      )}
    </div>
  );
}
