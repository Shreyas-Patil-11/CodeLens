import { useState, useRef } from "react";
import { api } from "../utils/api";

export function useAppState() {
  // ── Navigation ──────────────────────────────────────────────────────────
  const [tab, setTab] = useState("ingest");

  // ── Repo / collection ───────────────────────────────────────────────────
  const [repoUrl, setRepoUrl]           = useState("");
  const [collectionName, setCollectionName] = useState(null);

  // ── Ingest ──────────────────────────────────────────────────────────────
  const [ingestStatus, setIngestStatus] = useState("idle"); // idle | loading | done | error
  const [ingestStep,   setIngestStep]   = useState(0);
  const [ingestMsg,    setIngestMsg]    = useState("");

  // ── Chat ────────────────────────────────────────────────────────────────
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput,    setChatInput]    = useState("");
  const [chatLoading,  setChatLoading]  = useState(false);
  const chatEndRef = useRef(null);

  // ── Search ──────────────────────────────────────────────────────────────
  const [searchQuery,   setSearchQuery]   = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // ── Summary ─────────────────────────────────────────────────────────────
  const [summaryText,    setSummaryText]    = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  // ── Architecture ─────────────────────────────────────────────────────────
  const [archText,    setArchText]    = useState("");
  const [archLoading, setArchLoading] = useState(false);

  // ── Dependencies ─────────────────────────────────────────────────────────
  const [depsData,    setDepsData]    = useState(null);
  const [depsLoading, setDepsLoading] = useState(false);

  // ── Handlers ────────────────────────────────────────────────────────────

  const simulateSteps = async () => {
    for (let i = 0; i < 4; i++) {
      await new Promise(r => setTimeout(r, 900 + Math.random() * 600));
      setIngestStep(i + 1);
    }
  };

  const handleIngest = async () => {
    if (!repoUrl.trim()) return;
    setIngestStatus("loading");
    setIngestStep(0);
    simulateSteps();
    try {
      const data = await api.ingest(repoUrl);
      setCollectionName(data.collection_name);
      setIngestMsg(data.message);
      setIngestStep(4);
      setTimeout(() => setIngestStatus("done"), 500);
    } catch (e) {
      setIngestStatus("error");
      setIngestMsg(e.message);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim() || !collectionName || chatLoading) return;
    const question = chatInput;
    setChatMessages(p => [
      ...p,
      { role: "user", content: question },
      { role: "assistant", loading: true, content: "", state: "thinking" },
    ]);
    setChatInput("");
    setChatLoading(true);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    try {
      const data = await api.ask(question, collectionName);
      setChatMessages(p => {
        const msgs = [...p];
        msgs[msgs.length - 1] = {
          role: "assistant",
          content: data.answer,
          sources: data.sources,
          state: "done",
        };
        return msgs;
      });
    } catch (e) {
      setChatMessages(p => {
        const msgs = [...p];
        msgs[msgs.length - 1] = { role: "assistant", content: "Error: " + e.message, state: "error" };
        return msgs;
      });
    }
    setChatLoading(false);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !collectionName) return;
    setSearchLoading(true);
    setSearchResults([]);
    try {
      const data = await api.search(searchQuery, collectionName);
      setSearchResults(data.results || []);
    } catch {}
    setSearchLoading(false);
  };

  const handleSummary = async () => {
    if (!collectionName) return;
    setSummaryLoading(true);
    setSummaryText("");
    try {
      const data = await api.summary(collectionName);
      setSummaryText(data.answer);
    } catch (e) { setSummaryText("Error: " + e.message); }
    setSummaryLoading(false);
  };

  const handleArch = async () => {
    if (!collectionName) return;
    setArchLoading(true);
    setArchText("");
    try {
      const data = await api.architecture(collectionName);
      setArchText(data.answer);
    } catch (e) { setArchText("Error: " + e.message); }
    setArchLoading(false);
  };

  const handleDeps = async () => {
    if (!collectionName) return;
    setDepsLoading(true);
    setDepsData(null);
    try {
      const data = await api.dependencies(collectionName);
      setDepsData(data);
    } catch (e) { setDepsData({ error: e.message }); }
    setDepsLoading(false);
  };

  const isWorking = chatLoading || searchLoading || summaryLoading || archLoading || depsLoading || ingestStatus === "loading";

  return {
    // nav
    tab, setTab,
    // repo
    repoUrl, setRepoUrl, collectionName,
    // ingest
    ingestStatus, ingestStep, ingestMsg, handleIngest,
    // chat
    chatMessages, setChatMessages, chatInput, setChatInput, chatLoading, chatEndRef, handleChat,
    // search
    searchQuery, setSearchQuery, searchResults, searchLoading, handleSearch,
    // summary
    summaryText, summaryLoading, handleSummary,
    // arch
    archText, archLoading, handleArch,
    // deps
    depsData, depsLoading, handleDeps,
    // misc
    isWorking,
  };
}
