import { useEffect } from "react";
import { Badge, Spinner, TypingDots, FileChip, EmptyState } from "../components/ui/index";
import { RobotMascot } from "../components/ui/RobotMascot";

function ChatBubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 items-end ${isUser ? "flex-row-reverse" : ""} group`}>
      {!isUser && (
        <div className="shrink-0 mb-1">
          <RobotMascot state={msg.state || "done"} />
        </div>
      )}
      {isUser && (
        <div className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow mb-1">
          U
        </div>
      )}
      <div className={`max-w-[72%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm
          ${isUser
            ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-br-sm"
            : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm"}`}
        >
          {msg.role === "assistant" && msg.loading ? (
            <div className="flex items-center gap-2 text-indigo-400">
              <TypingDots />
              <span className="text-xs">thinking…</span>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
          )}
        </div>
        {msg.sources && msg.sources.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {msg.sources.map((s, i) => <FileChip key={i} path={s} />)}
          </div>
        )}
      </div>
    </div>
  );
}

const SUGGESTED = [
  "What does this codebase do?",
  "How is authentication handled?",
  "Explain the main entry point",
];

export function ChatPage({
  collectionName,
  chatMessages,
  setChatMessages,
  chatInput,
  setChatInput,
  chatLoading,
  chatEndRef,
  handleChat,
}) {
  // Scroll to bottom whenever messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatEndRef]);

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto fadein">
      {/* ── Fixed header ── */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 shrink-0 border-b border-slate-100 bg-gradient-to-br from-slate-50 via-indigo-50/40 to-violet-50/30">
        <h1 className="text-2xl font-extrabold text-indigo-900">AI Agent Chat</h1>
        {collectionName && <Badge color="green">Live</Badge>}
        {chatMessages.length > 0 && (
          <button
            onClick={() => setChatMessages([])}
            className="ml-auto text-xs text-slate-400 hover:text-red-400 transition font-semibold px-2 py-1 rounded-lg hover:bg-red-50"
          >
            Clear ✕
          </button>
        )}
      </div>

      {!collectionName ? (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState icon="🤖" title="No repo loaded yet" subtitle="Go to Ingest Repo to get started" />
        </div>
      ) : (
        <>
          {/* ── Scrollable messages — ONLY this scrolls ── */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-5 px-4 py-4 min-h-0">
            {chatMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center fadein">
                <RobotMascot state="idle" />
                <p className="font-bold text-slate-700">
                  Ask me anything about{" "}
                  <span className="text-indigo-600 font-mono">{collectionName}</span>
                </p>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {SUGGESTED.map(q => (
                    <button
                      key={q}
                      onClick={() => setChatInput(q)}
                      className="px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-xs text-indigo-700 hover:bg-indigo-100 transition font-semibold"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatMessages.map((m, i) => <ChatBubble key={i} msg={m} />)}
            <div ref={chatEndRef} />
          </div>

          {/* ── Fixed input bar — never scrolls ── */}
          <div className="shrink-0 px-4 py-3 border-t border-slate-100 bg-white/80 backdrop-blur">
            <div className="flex gap-2 bg-white border border-slate-200 rounded-2xl shadow-md p-2 focus-within:ring-2 focus-within:ring-indigo-300 focus-within:border-indigo-300 transition-all">
              <input
                className="flex-1 px-3 py-2 text-sm focus:outline-none bg-transparent"
                placeholder="Ask about your codebase…"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleChat()}
                disabled={chatLoading}
              />
              <button
                onClick={handleChat}
                disabled={chatLoading || !chatInput.trim()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold text-sm disabled:opacity-40 hover:shadow-md active:scale-95 transition-all flex items-center gap-2"
              >
                {chatLoading ? <Spinner size={4} /> : <><span>Send</span><span className="text-xs opacity-70">↑</span></>}
              </button>
            </div>
            <p className="text-[10px] text-slate-300 text-center mt-1.5">
              Press Enter to send · powered by Llama 3.1 agent
            </p>
          </div>
        </>
      )}
    </div>
  );
}
