import { useEffect, useRef, useState } from "react";
import { Card, Spinner, Badge, EmptyState } from "../components/ui/index";
import { RobotMascot } from "../components/ui/RobotMascot";

function DependencyMap({ data }) {
  const svgRef    = useRef(null);
  const [selected, setSelected] = useState(null);
  const [search,   setSearch]   = useState("");

  useEffect(() => {
    if (!data?.nodes || !svgRef.current) return;

    const renderGraph = async () => {
      if (!window.d3) {
        await new Promise((res, rej) => {
          const s = document.createElement("script");
          s.src = "https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js";
          s.onload = res;
          s.onerror = rej;
          document.head.appendChild(s);
        });
      }
      const d3        = window.d3;
      const container = svgRef.current;
      container.innerHTML = "";

      const W = container.clientWidth  || 700;
      const H = container.clientHeight || 500;

      // Deep-clone so D3 can mutate freely
      const nodes = data.nodes.map(n => ({ ...n }));
      const edges = data.edges.map(e => ({ ...e }));

      const extColor = (id = "") => {
        const ext = id.split(".").pop();
        return { py:"#818cf8", js:"#fbbf24", jsx:"#34d399", ts:"#38bdf8", tsx:"#a78bfa", json:"#fb923c" }[ext] || "#94a3b8";
      };

      const svg = d3.select(container)
        .append("svg").attr("width","100%").attr("height","100%")
        .attr("viewBox", `0 0 ${W} ${H}`);

      svg.append("defs").append("marker")
        .attr("id","arrowhead").attr("viewBox","0 -5 10 10")
        .attr("refX",18).attr("refY",0)
        .attr("markerWidth",6).attr("markerHeight",6)
        .attr("orient","auto")
        .append("path").attr("d","M0,-5L10,0L0,5").attr("fill","#818cf8").attr("opacity",0.6);

      const g = svg.append("g");

      svg.call(
        d3.zoom().scaleExtent([0.2, 3]).on("zoom", e => g.attr("transform", e.transform))
      );

      const sim = d3.forceSimulation(nodes)
        .force("link",      d3.forceLink(edges).id(d => d.id).distance(90).strength(0.4))
        .force("charge",    d3.forceManyBody().strength(-200))
        .force("center",    d3.forceCenter(W / 2, H / 2))
        .force("collision", d3.forceCollide(28));

      const link = g.append("g").selectAll("line")
        .data(edges).enter().append("line")
        .attr("stroke","#818cf8").attr("stroke-opacity",0.35)
        .attr("stroke-width",1.5).attr("marker-end","url(#arrowhead)");

      const node = g.append("g").selectAll("g")
        .data(nodes).enter().append("g")
        .attr("cursor","pointer")
        .call(
          d3.drag()
            .on("start", (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
            .on("drag",  (e, d) => { d.fx = e.x; d.fy = e.y; })
            .on("end",   (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; })
        )
        .on("click", (e, d) => setSelected(d));

      node.append("circle")
        .attr("r", 14)
        .attr("fill",         d => extColor(d.id))
        .attr("fill-opacity", 0.2)
        .attr("stroke",       d => extColor(d.id))
        .attr("stroke-width", 2);

      node.append("text")
        .attr("text-anchor","middle").attr("dy","0.35em")
        .attr("font-size","7px").attr("font-family","JetBrains Mono,monospace")
        .attr("fill","#3730a3").attr("pointer-events","none")
        .text(d => (d.data?.label || d.id.split("/").pop()).slice(0, 8));

      node.append("title").text(d => d.id);

      sim.on("tick", () => {
        link.attr("x1", d => d.source.x).attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
        node.attr("transform", d => `translate(${d.x},${d.y})`);
      });
    };

    renderGraph();
  }, [data]);

  const filteredNodes = (data?.nodes || []).filter(n =>
    !search || n.id.toLowerCase().includes(search.toLowerCase())
  );

  const outgoing = (id) => data.edges.filter(e => e.source === id || e.source?.id === id).length;
  const incoming = (id) => data.edges.filter(e => e.target === id || e.target?.id === id).length;

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* toolbar */}
      <div className="flex items-center gap-3 flex-wrap shrink-0">
        <Badge color="indigo">{data?.nodes?.length || 0} nodes</Badge>
        <Badge color="amber">{data?.edges?.length || 0} edges</Badge>
        <input
          className="ml-auto border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300 font-mono w-48"
          placeholder="Filter files…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-1 text-[10px]">
          {[["py","#818cf8"],["js","#fbbf24"],["jsx","#34d399"],["ts","#38bdf8"],["tsx","#a78bfa"]].map(([ext,c]) => (
            <span key={ext} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-slate-100 font-mono text-slate-500">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: c }} />
              {ext}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-3 flex-1 min-h-0">
        {/* graph canvas */}
        <div
          ref={svgRef}
          className="flex-1 bg-gradient-to-br from-indigo-50/50 to-violet-50/50 border border-indigo-100 rounded-2xl overflow-hidden"
          style={{ minHeight: "400px" }}
        />

        {/* side panel */}
        <div className="w-52 shrink-0 flex flex-col gap-2">
          {selected ? (
            <Card className="p-3 fadein">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Selected</p>
              <p className="text-xs font-mono text-indigo-700 break-all leading-5">{selected.id}</p>
              <hr className="my-2 border-slate-100" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Connections</p>
              <p className="text-xs text-slate-500">↗ {outgoing(selected.id)} outgoing</p>
              <p className="text-xs text-slate-500">↙ {incoming(selected.id)} incoming</p>
              <button onClick={() => setSelected(null)} className="mt-2 text-xs text-slate-400 hover:text-red-400 transition">Clear ✕</button>
            </Card>
          ) : (
            <Card className="p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Click a node</p>
              <p className="text-xs text-slate-400">Select any node in the graph to inspect its dependencies.</p>
            </Card>
          )}

          {/* scrollable file list */}
          <Card className="p-2 flex-1 overflow-y-auto min-h-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-1">Files</p>
            <div className="flex flex-col gap-0.5">
              {filteredNodes.slice(0, 80).map(n => (
                <button
                  key={n.id}
                  onClick={() => setSelected(n)}
                  className={`text-left px-2 py-1 rounded text-[10px] font-mono truncate transition
                    ${selected?.id === n.id ? "bg-indigo-100 text-indigo-700" : "text-slate-500 hover:bg-slate-50"}`}
                  title={n.id}
                >
                  {n.id.split("/").slice(-1)[0]}
                </button>
              ))}
              {filteredNodes.length > 80 && (
                <p className="text-[10px] text-slate-300 px-2">+{filteredNodes.length - 80} more</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function DepsPage({ collectionName, depsData, depsLoading, handleDeps }) {
  return (
    <div className="h-full flex flex-col fadein" style={{ minHeight: "calc(100vh - 160px)" }}>
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-indigo-900">Dependency Map</h1>
          <p className="text-slate-500 text-sm">Interactive force-directed graph of file imports.</p>
        </div>
        {collectionName && (
          <button
            onClick={handleDeps}
            disabled={depsLoading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold text-sm shadow hover:shadow-lg transition disabled:opacity-60 flex items-center gap-2"
          >
            {depsLoading ? <><Spinner size={4} /> Loading</> : "🕸️ Load Graph"}
          </button>
        )}
      </div>

      {!collectionName ? (
        <EmptyState icon="🕸️" title="No repo loaded" subtitle="Ingest a repository first" />
      ) : depsLoading ? (
        <Card className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
          <RobotMascot state="thinking" />
          <p className="text-sm text-slate-500 font-semibold">Building dependency graph…</p>
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-indigo-400"
                style={{ animation: `bounce 0.8s ease-in-out ${i * 0.12}s infinite` }} />
            ))}
          </div>
        </Card>
      ) : depsData && !depsData.error ? (
        <Card className="flex-1 p-4 fadein overflow-hidden flex flex-col">
          <DependencyMap data={depsData} />
        </Card>
      ) : depsData?.error ? (
        <Card className="p-6">
          <p className="text-red-500 text-sm">❌ {depsData.error}</p>
        </Card>
      ) : (
        <Card className="flex-1 flex flex-col items-center justify-center gap-4 p-10">
          <RobotMascot state="idle" />
          <p className="text-slate-500 text-sm">Click "Load Graph" to visualize dependencies</p>
          <p className="text-xs text-slate-400">Drag nodes · Scroll to zoom · Click to inspect</p>
        </Card>
      )}
    </div>
  );
}
