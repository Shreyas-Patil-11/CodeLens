import { Card, Spinner, EmptyState, MarkdownView } from "../components/ui/index";
import { RobotMascot } from "../components/ui/RobotMascot";

export function SummaryPage({ collectionName, summaryText, summaryLoading, handleSummary }) {
  return (
    <div className="max-w-2xl mx-auto fadein">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-indigo-900">Codebase Summary</h1>
          <p className="text-slate-500 text-sm">AI-generated overview of tech stack, architecture & entry points.</p>
        </div>
        {collectionName && (
          <button
            onClick={handleSummary}
            disabled={summaryLoading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold text-sm shadow hover:shadow-lg transition disabled:opacity-60 flex items-center gap-2"
          >
            {summaryLoading ? <><Spinner size={4} /> Generating</> : "✨ Generate"}
          </button>
        )}
      </div>

      {!collectionName ? (
        <EmptyState icon="📋" title="No repo loaded" subtitle="Ingest a repository first" />
      ) : summaryLoading ? (
        <Card className="p-8 flex flex-col items-center gap-4">
          <RobotMascot state="thinking" />
          <p className="text-sm text-slate-500 font-semibold">Analyzing your codebase…</p>
          <div className="flex flex-col gap-2 w-full mt-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-4 rounded shimmer" style={{ width: `${60 + i * 8}%` }} />
            ))}
          </div>
        </Card>
      ) : summaryText ? (
        <Card className="p-6 fadein">
          <MarkdownView text={summaryText} />
        </Card>
      ) : (
        <Card className="p-10 flex flex-col items-center gap-4">
          <RobotMascot state="idle" />
          <p className="text-slate-500 text-sm">Click "Generate" to analyze the repository</p>
        </Card>
      )}
    </div>
  );
}
