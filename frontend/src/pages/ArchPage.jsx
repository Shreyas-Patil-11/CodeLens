import { useEffect, useRef, useState } from "react";
import { Card, Spinner, Badge, EmptyState } from "../components/ui/index";
import { RobotMascot } from "../components/ui/RobotMascot";

function MermaidDiagram({ chart }) {
  const ref = useRef(null);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [showCode, setShowCode] = useState(false);

  const rawCode = chart.replace(/```mermaid\s*/gi, "").replace(/```\s*/g, "").trim();

  useEffect(() => {
    if (!rawCode || !ref.current) return;
    setError(null);

    const render = async () => {
      try {
        if (!window.mermaid) {
          await new Promise((resolve, reject) => {
            const s = document.createElement("script");
            s.src = "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js";
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
          });
        }
        window.mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          themeVariables: {
            primaryColor:        "#ede9fe",
            primaryTextColor:    "#3730a3",
            primaryBorderColor:  "#6366f1",
            lineColor:           "#818cf8",
            secondaryColor:      "#e0f2fe",
            tertiaryColor:       "#fdf4ff",
            background:          "#ffffff",
            nodeBorder:          "#6366f1",
            clusterBkg:          "#f5f3ff",
            titleColor:          "#3730a3",
            edgeLabelBackground: "#f5f3ff",
          },
          flowchart: { curve: "basis", padding: 20 },
        });
        const id = `mermaid-${Date.now()}`;
        const { svg } = await window.mermaid.render(id, rawCode);
        if (ref.current) ref.current.innerHTML = svg;
      } catch (e) {
        setError(e.message || "Failed to render diagram");
        if (ref.current) ref.current.innerHTML = "";
      }
    };

    render();
  }, [rawCode]);

  return (
    <div className="flex flex-col gap-3">
      {/* toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge color="indigo">Live Diagram</Badge>
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 ml-auto">
          <button onClick={() => setZoom(z => Math.max(0.4, z - 0.15))}
            className="w-7 h-7 rounded-md flex items-center justify-center text-slate-600 hover:bg-white hover:shadow text-lg font-bold transition">−</button>
          <span className="text-xs font-mono text-slate-500 w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(2.5, z + 0.15))}
            className="w-7 h-7 rounded-md flex items-center justify-center text-slate-600 hover:bg-white hover:shadow text-lg font-bold transition">+</button>
          <button onClick={() => setZoom(1)}
            className="w-7 h-7 rounded-md flex items-center justify-center text-slate-500 hover:bg-white hover:shadow text-xs transition">↺</button>
        </div>
        <button
          onClick={() => setShowCode(s => !s)}
          className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${showCode ? "bg-slate-800 text-emerald-300 border-slate-700" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"}`}
        >
          {showCode ? "◀ Diagram" : "⌨ Raw Code"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600 font-mono">{error}</div>
      )}

      {showCode ? (
        <div className="bg-slate-950 rounded-2xl p-5 overflow-x-auto fadein">
          <pre className="text-emerald-300 text-xs font-mono whitespace-pre-wrap leading-6">{rawCode}</pre>
        </div>
      ) : (
        <div
          className="bg-gradient-to-br from-indigo-50/60 to-violet-50/60 border border-indigo-100 rounded-2xl overflow-auto min-h-[300px] flex items-center justify-center p-4 fadein"
          style={{ maxHeight: "62vh" }}
        >
          <div
            ref={ref}
            style={{ transform: `scale(${zoom})`, transformOrigin: "top center", transition: "transform 0.2s ease" }}
            className="w-full [&_svg]:max-w-full [&_svg]:h-auto"
          />
          {!error && ref.current && !ref.current.innerHTML && (
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <Spinner size={7} />
              <span className="text-sm">Rendering diagram…</span>
            </div>
          )}
        </div>
      )}

      <a
        href={`https://mermaid.live/edit#base64:${btoa(unescape(encodeURIComponent(rawCode)))}`}
        target="_blank"
        rel="noreferrer"
        className="self-start inline-flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-700 font-semibold transition"
      >
        🔗 Open in Mermaid Live Editor ↗
      </a>
    </div>
  );
}

export function ArchPage({ collectionName, archText, archLoading, handleArch }) {
  return (
    <div className="max-w-2xl mx-auto fadein">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-indigo-900">Architecture Map</h1>
          <p className="text-slate-500 text-sm">Mermaid.js diagram of your repo's high-level structure.</p>
        </div>
        {collectionName && (
          <button
            onClick={handleArch}
            disabled={archLoading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold text-sm shadow hover:shadow-lg transition disabled:opacity-60 flex items-center gap-2"
          >
            {archLoading ? <><Spinner size={4} /> Generating</> : "🏛️ Generate"}
          </button>
        )}
      </div>

      {!collectionName ? (
        <EmptyState icon="🏛️" title="No repo loaded" subtitle="Ingest a repository first" />
      ) : archLoading ? (
        <Card className="p-8 flex flex-col items-center gap-4">
          <RobotMascot state="thinking" />
          <p className="text-sm text-slate-500 font-semibold">Mapping architecture…</p>
        </Card>
      ) : archText ? (
        <Card className="p-6 fadein">
          <MermaidDiagram chart={archText} />
        </Card>
      ) : (
        <Card className="p-10 flex flex-col items-center gap-4">
          <RobotMascot state="idle" />
          <p className="text-slate-500 text-sm">Click "Generate" to map the architecture</p>
        </Card>
      )}
    </div>
  );
}
