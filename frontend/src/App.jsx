import "./index.css";
import { useAppState }  from "./hooks/useAppState";
import { Topbar }       from "./components/layout/Topbar";
import { Sidebar }      from "./components/layout/Sidebar";
import { IngestPage }   from "./pages/IngestPage";
import { ChatPage }     from "./pages/ChatPage";
import { SearchPage }   from "./pages/SearchPage";
import { SummaryPage }  from "./pages/SummaryPage";
import { ArchPage }     from "./pages/ArchPage";
import { DepsPage }     from "./pages/DepsPage";

export default function App() {
  const state = useAppState();

  const chatCount = state.chatMessages.filter(
    m => m.role === "assistant" && !m.loading
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-violet-50/30 flex flex-col">
      <Topbar collectionName={state.collectionName} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          tab={state.tab}
          setTab={state.setTab}
          collectionName={state.collectionName}
          chatCount={chatCount}
          isWorking={state.isWorking}
        />

        {/* ── Main area ── */}
        <main className={`flex-1 flex flex-col min-h-0 ${state.tab !== "chat" ? "overflow-y-auto p-6" : "overflow-hidden"}`}>

          {state.tab === "ingest" && (
            <IngestPage
              repoUrl={state.repoUrl}
              setRepoUrl={state.setRepoUrl}
              ingestStatus={state.ingestStatus}
              ingestStep={state.ingestStep}
              ingestMsg={state.ingestMsg}
              handleIngest={state.handleIngest}
              onDone={() => state.setTab("chat")}
            />
          )}

          {state.tab === "chat" && (
            <ChatPage
              collectionName={state.collectionName}
              chatMessages={state.chatMessages}
              setChatMessages={state.setChatMessages}
              chatInput={state.chatInput}
              setChatInput={state.setChatInput}
              chatLoading={state.chatLoading}
              chatEndRef={state.chatEndRef}
              handleChat={state.handleChat}
            />
          )}

          {state.tab === "search" && (
            <SearchPage
              collectionName={state.collectionName}
              searchQuery={state.searchQuery}
              setSearchQuery={state.setSearchQuery}
              searchResults={state.searchResults}
              searchLoading={state.searchLoading}
              handleSearch={state.handleSearch}
            />
          )}

          {state.tab === "summary" && (
            <SummaryPage
              collectionName={state.collectionName}
              summaryText={state.summaryText}
              summaryLoading={state.summaryLoading}
              handleSummary={state.handleSummary}
            />
          )}

          {state.tab === "arch" && (
            <ArchPage
              collectionName={state.collectionName}
              archText={state.archText}
              archLoading={state.archLoading}
              handleArch={state.handleArch}
            />
          )}

          {state.tab === "deps" && (
            <DepsPage
              collectionName={state.collectionName}
              depsData={state.depsData}
              depsLoading={state.depsLoading}
              handleDeps={state.handleDeps}
            />
          )}

        </main>
      </div>
    </div>
  );
}
