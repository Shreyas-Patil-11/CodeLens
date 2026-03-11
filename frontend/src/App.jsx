
// import { useState } from 'react';
// import axios from 'axios';
// import { Github, Send, Loader2, Database, Code2, AlertCircle, Network } from 'lucide-react';
// import ReactMarkdown from 'react-markdown';
// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
// import Mermaid from './Mermaid';
// import DependencyMap from './DependencyMap';

// const API_BASE = 'http://127.0.0.1:8000/api';

// export default function App() {
//   const [repoUrl, setRepoUrl] = useState('');
//   const [isIngesting, setIsIngesting] = useState(false);
//   const [ingestStatus, setIngestStatus] = useState(null);
  
//   const [collectionName, setCollectionName] = useState(null);
  
//   const [question, setQuestion] = useState('');
//   const [isAsking, setIsAsking] = useState(false);
//   const [chatHistory, setChatHistory] = useState([]);
  
//   // NEW: State to toggle between Chat and Dependency Map
//   const [activeTab, setActiveTab] = useState('chat');

//   const handleIngest = async (e) => {
//     e.preventDefault();
//     if (!repoUrl) return;
    
//     setIsIngesting(true);
//     setIngestStatus(null);
//     setCollectionName(null);
//     setChatHistory([]); 
//     setActiveTab('chat'); // Reset to chat view on new ingest
    
//     try {
//       const res = await axios.post(`${API_BASE}/ingest`, { repo_url: repoUrl });
//       setIngestStatus({ type: 'success', message: res.data.message });
//       setCollectionName(res.data.collection_name);
//     } catch (err) {
//       setIngestStatus({ 
//         type: 'error', 
//         message: err.response?.data?.detail || 'Failed to ingest repository.' 
//       });
//     } finally {
//       setIsIngesting(false);
//     }
//   };

//   const handleAsk = async (e) => {
//     e.preventDefault();
//     if (!question || isAsking || !collectionName) return;

//     const userMessage = { role: 'user', content: question };
//     setChatHistory(prev => [...prev, userMessage]);
//     setQuestion('');
//     setIsAsking(true);

//     try {
//       const res = await axios.post(`${API_BASE}/ask`, { 
//         question: userMessage.content,
//         collection_name: collectionName 
//       });
      
//       const aiMessage = { 
//         role: 'ai', 
//         content: res.data.answer, 
//         sources: res.data.sources 
//       };
//       setChatHistory(prev => [...prev, aiMessage]);
//     } catch (err) {
//       setChatHistory(prev => [...prev, { 
//         role: 'error', 
//         content: 'Failed to connect to the reasoning engine.' 
//       }]);
//     } finally {
//       setIsAsking(false);
//     }
//   };

//   const handleGenerateArchitecture = async () => {
//     if (!collectionName || isAsking) return;
    
//     setChatHistory(prev => [...prev, { role: 'user', content: 'Please generate a Mermaid.js architecture diagram for this repository.' }]);
//     setIsAsking(true);

//     try {
//       const res = await axios.post(`${API_BASE}/architecture`, { 
//         collection_name: collectionName 
//       });
      
//       const aiMessage = { 
//         role: 'ai', 
//         content: res.data.answer, 
//         sources: [] 
//       };
//       setChatHistory(prev => [...prev, aiMessage]);
//     } catch (err) {
//       setChatHistory(prev => [...prev, { 
//         role: 'error', 
//         content: 'Failed to generate architecture diagram.' 
//       }]);
//     } finally {
//       setIsAsking(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
//       <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
//         <div className="flex items-center gap-2">
//           <div className="bg-blue-600 p-2 rounded-lg">
//             <Code2 className="text-white w-6 h-6" />
//           </div>
//           <h1 className="text-xl font-bold text-gray-800">Repo-Ramp</h1>
//           {collectionName && (
//             <span className="ml-4 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
//               DB: {collectionName}
//             </span>
//           )}
//         </div>
        
//         <form onSubmit={handleIngest} className="flex gap-3 w-1/2 max-w-2xl">
//           <div className="relative flex-1">
//             <Github className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
//             <input
//               type="url"
//               value={repoUrl}
//               onChange={(e) => setRepoUrl(e.target.value)}
//               placeholder="Paste GitHub Repository URL (.git)"
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
//               required
//             />
//           </div>
//           <button 
//             type="submit" 
//             disabled={isIngesting}
//             className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-70 flex items-center gap-2 transition-all"
//           >
//             {isIngesting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
//             {isIngesting ? 'Indexing...' : 'Ingest Code'}
//           </button>
//         </form>
//       </header>

//       <main className="flex-1 max-w-5xl w-full mx-auto p-6 flex flex-col gap-6 h-[calc(100vh-80px)]">
//         {ingestStatus && (
//           <div className={`p-4 rounded-lg flex items-center gap-3 shrink-0 ${ingestStatus.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
//             {ingestStatus.type === 'error' && <AlertCircle className="w-5 h-5" />}
//             <p className="font-medium">{ingestStatus.message}</p>
//           </div>
//         )}

//         <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden min-h-0">
          
//           {/* NEW: Tab Navigation */}
//           {collectionName && (
//              <div className="flex border-b border-gray-200 bg-gray-50/50 shrink-0">
//                <button 
//                  onClick={() => setActiveTab('chat')}
//                  className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'chat' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
//                >
//                  AI Copilot
//                </button>
//                <button 
//                  onClick={() => setActiveTab('map')}
//                  className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'map' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
//                >
//                  Dependency Map
//                </button>
//              </div>
//            )}

//           {/* Conditional Rendering based on activeTab */}
//           {activeTab === 'chat' ? (
//             <>
//               <div className="flex-1 overflow-y-auto p-6 space-y-6">
//                 {chatHistory.length === 0 ? (
//                   <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
//                     <Code2 className="w-16 h-16 text-gray-200" />
//                     <p className="text-lg font-medium">Ingest a repository to start chatting with the codebase.</p>
//                   </div>
//                 ) : (
//                   chatHistory.map((msg, idx) => (
//                     <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
//                       <div className={`max-w-[80%] rounded-2xl p-5 ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : msg.role === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-50 border border-gray-100 text-gray-800 rounded-bl-none overflow-x-auto w-full'}`}>
                        
//                         {msg.role !== 'user' && msg.role !== 'error' ? (
//                           <div className="prose max-w-none text-sm leading-relaxed text-gray-800">
//                             <ReactMarkdown
//                               components={{
//                                 code({ node, inline, className, children, ...props }) {
//                                   const match = /language-(\w+)/.exec(className || '');
                                  
//                                   if (!inline && match && match[1] === 'mermaid') {
//                                     return <Mermaid chart={String(children).replace(/\n$/, '')} />;
//                                   }

//                                   return !inline && match ? (
//                                     <div className="rounded-md overflow-hidden my-4 border border-gray-700 shadow-sm">
//                                       <div className="bg-gray-800 text-gray-400 text-xs px-4 py-1.5 flex justify-between font-mono">
//                                         <span>{match[1]}</span>
//                                       </div>
//                                       <SyntaxHighlighter
//                                         {...props}
//                                         style={vscDarkPlus}
//                                         language={match[1]}
//                                         PreTag="div"
//                                         customStyle={{ margin: 0, padding: '1rem', background: '#1e1e1e' }}
//                                       >
//                                         {String(children).replace(/\n$/, '')}
//                                       </SyntaxHighlighter>
//                                     </div>
//                                   ) : (
//                                     <code {...props} className="bg-gray-200 text-red-600 px-1.5 py-0.5 rounded-md text-sm font-mono">
//                                       {children}
//                                     </code>
//                                   );
//                                 }
//                               }}
//                             >
//                               {msg.content}
//                             </ReactMarkdown>
//                           </div>
//                         ) : (
//                           <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
//                         )}
                        
//                         {msg.sources && msg.sources.length > 0 && (
//                           <div className="mt-4 pt-4 border-t border-gray-200">
//                             <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Referenced Files:</p>
//                             <ul className="space-y-1 flex flex-wrap gap-2">
//                               {msg.sources.map((source, sIdx) => (
//                                 <li key={sIdx} className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
//                                   {source.split('\\').pop() || source.split('/').pop()}
//                                 </li>
//                               ))}
//                             </ul>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   ))
//                 )}
//                 {isAsking && (
//                   <div className="flex justify-start">
//                     <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-none p-5 flex items-center gap-3">
//                       <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
//                       <span className="text-gray-500 font-medium">Analyzing architecture...</span>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <div className="p-4 bg-white border-t border-gray-100 shrink-0">
//                 {collectionName && (
//                   <div className="flex gap-2 mb-3">
//                     <button 
//                       onClick={handleGenerateArchitecture}
//                       disabled={isAsking}
//                       className="text-xs flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full hover:bg-indigo-100 border border-indigo-200 transition-colors disabled:opacity-50"
//                     >
//                       <Network className="w-3.5 h-3.5" />
//                       Generate Architecture Map
//                     </button>
//                   </div>
//                 )}
                
//                 <form onSubmit={handleAsk} className="relative flex items-center">
//                   <input
//                     type="text"
//                     value={question}
//                     onChange={(e) => setQuestion(e.target.value)}
//                     placeholder="Ask about the architecture, routing, or dependencies..."
//                     className="w-full bg-gray-50 border border-gray-200 rounded-full pl-6 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
//                     disabled={!collectionName}
//                   />
//                   <button 
//                     type="submit"
//                     disabled={!question || isAsking || !collectionName}
//                     className="absolute right-2 bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors"
//                   >
//                     <Send className="w-5 h-5" />
//                   </button>
//                 </form>
//               </div>
//             </>
//           ) : (
//             // Dependency Map Area
//             <div className="flex-1 w-full h-full p-2 bg-slate-50 flex">
//                {/* Pass collectionName to React Flow to render the graph */}
//                <DependencyMap collectionName={collectionName} />
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }

import { useState } from 'react';
import axios from 'axios';
import { Github, Send, Loader2, Database, Code2, AlertCircle, Network, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Mermaid from './Mermaid';
import DependencyMap from './DependencyMap';
import CodeSearch from './CodeSearch'; 

const API_BASE = 'http://127.0.0.1:8000/api';

export default function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestStatus, setIngestStatus] = useState(null);
  
  const [collectionName, setCollectionName] = useState(null);
  
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  
  // State to toggle between Chat, Search, and Map
  const [activeTab, setActiveTab] = useState('chat');

  const handleIngest = async (e) => {
    e.preventDefault();
    if (!repoUrl) return;
    
    setIsIngesting(true);
    setIngestStatus(null);
    setCollectionName(null);
    setChatHistory([]); 
    setActiveTab('chat'); // Reset to chat view on new ingest
    
    try {
      const res = await axios.post(`${API_BASE}/ingest`, { repo_url: repoUrl });
      setIngestStatus({ type: 'success', message: res.data.message });
      setCollectionName(res.data.collection_name);
    } catch (err) {
      setIngestStatus({ 
        type: 'error', 
        message: err.response?.data?.detail || 'Failed to ingest repository.' 
      });
    } finally {
      setIsIngesting(false);
    }
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question || isAsking || !collectionName) return;

    const userMessage = { role: 'user', content: question };
    setChatHistory(prev => [...prev, userMessage]);
    setQuestion('');
    setIsAsking(true);

    try {
      const res = await axios.post(`${API_BASE}/ask`, { 
        question: userMessage.content,
        collection_name: collectionName 
      });
      
      const aiMessage = { 
        role: 'ai', 
        content: res.data.answer, 
        sources: res.data.sources 
      };
      setChatHistory(prev => [...prev, aiMessage]);
    } catch (err) {
      setChatHistory(prev => [...prev, { 
        role: 'error', 
        content: 'Failed to connect to the reasoning engine.' 
      }]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleGenerateArchitecture = async () => {
    if (!collectionName || isAsking) return;
    
    setChatHistory(prev => [...prev, { role: 'user', content: 'Please generate a Mermaid.js architecture diagram for this repository.' }]);
    setIsAsking(true);

    try {
      const res = await axios.post(`${API_BASE}/architecture`, { 
        collection_name: collectionName 
      });
      
      const aiMessage = { 
        role: 'ai', 
        content: res.data.answer, 
        sources: [] 
      };
      setChatHistory(prev => [...prev, aiMessage]);
    } catch (err) {
      setChatHistory(prev => [...prev, { 
        role: 'error', 
        content: 'Failed to generate architecture diagram.' 
      }]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!collectionName || isAsking) return;
    
    setChatHistory(prev => [...prev, { role: 'user', content: 'Please generate a comprehensive summary of this codebase.' }]);
    setIsAsking(true);

    try {
      const res = await axios.post(`${API_BASE}/summary`, { 
        collection_name: collectionName 
      });
      
      const aiMessage = { 
        role: 'ai', 
        content: res.data.answer, 
        sources: [] 
      };
      setChatHistory(prev => [...prev, aiMessage]);
    } catch (err) {
      setChatHistory(prev => [...prev, { 
        role: 'error', 
        content: 'Failed to generate codebase summary.' 
      }]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Code2 className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Repo-Ramp</h1>
          {collectionName && (
            <span className="ml-4 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
              DB: {collectionName}
            </span>
          )}
        </div>
        
        <form onSubmit={handleIngest} className="flex gap-3 w-1/2 max-w-2xl">
          <div className="relative flex-1">
            <Github className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="Paste GitHub Repository URL (.git)"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={isIngesting}
            className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-70 flex items-center gap-2 transition-all"
          >
            {isIngesting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
            {isIngesting ? 'Indexing...' : 'Ingest Code'}
          </button>
        </form>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 flex flex-col gap-6 h-[calc(100vh-80px)]">
        {ingestStatus && (
          <div className={`p-4 rounded-lg flex items-center gap-3 shrink-0 ${ingestStatus.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {ingestStatus.type === 'error' && <AlertCircle className="w-5 h-5" />}
            <p className="font-medium">{ingestStatus.message}</p>
          </div>
        )}

        <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden min-h-0">
          
          {/* 3-Way Tab Navigation */}
          {collectionName && (
             <div className="flex border-b border-gray-200 bg-gray-50/50 shrink-0 overflow-x-auto">
               <button 
                 onClick={() => setActiveTab('chat')}
                 className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'chat' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
               >
                 AI Copilot
               </button>
               <button 
                 onClick={() => setActiveTab('search')}
                 className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'search' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
               >
                 Semantic Search
               </button>
               <button 
                 onClick={() => setActiveTab('map')}
                 className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'map' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
               >
                 Dependency Map
               </button>
             </div>
           )}

          {/* Tab 1: AI Copilot (Chat) */}
          {activeTab === 'chat' && (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {chatHistory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                    <Code2 className="w-16 h-16 text-gray-200" />
                    <p className="text-lg font-medium">Ingest a repository to start chatting with the codebase.</p>
                  </div>
                ) : (
                  chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl p-5 ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : msg.role === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-50 border border-gray-100 text-gray-800 rounded-bl-none overflow-x-auto w-full'}`}>
                        
                        {msg.role !== 'user' && msg.role !== 'error' ? (
                          <div className="prose max-w-none text-sm leading-relaxed text-gray-800">
                            <ReactMarkdown
                              components={{
                                code({ node, inline, className, children, ...props }) {
                                  const match = /language-(\w+)/.exec(className || '');
                                  
                                  if (!inline && match && match[1] === 'mermaid') {
                                    return <Mermaid chart={String(children).replace(/\n$/, '')} />;
                                  }

                                  return !inline && match ? (
                                    <div className="rounded-md overflow-hidden my-4 border border-gray-700 shadow-sm">
                                      <div className="bg-gray-800 text-gray-400 text-xs px-4 py-1.5 flex justify-between font-mono">
                                        <span>{match[1]}</span>
                                      </div>
                                      <SyntaxHighlighter
                                        {...props}
                                        style={vscDarkPlus}
                                        language={match[1]}
                                        PreTag="div"
                                        customStyle={{ margin: 0, padding: '1rem', background: '#1e1e1e' }}
                                      >
                                        {String(children).replace(/\n$/, '')}
                                      </SyntaxHighlighter>
                                    </div>
                                  ) : (
                                    <code {...props} className="bg-gray-200 text-red-600 px-1.5 py-0.5 rounded-md text-sm font-mono">
                                      {children}
                                    </code>
                                  );
                                }
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        )}
                        
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Referenced Files:</p>
                            <ul className="space-y-1 flex flex-wrap gap-2">
                              {msg.sources.map((source, sIdx) => (
                                <li key={sIdx} className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                  {source.split('\\').pop() || source.split('/').pop()}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {isAsking && (
                  <div className="flex justify-start">
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-none p-5 flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                      <span className="text-gray-500 font-medium">Analyzing architecture...</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                {collectionName && (
                  <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                    <button 
                      onClick={handleGenerateArchitecture}
                      disabled={isAsking}
                      className="text-xs flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full hover:bg-indigo-100 border border-indigo-200 transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      <Network className="w-3.5 h-3.5" />
                      Generate Architecture Map
                    </button>
                    
                    <button 
                      onClick={handleGenerateSummary}
                      disabled={isAsking}
                      className="text-xs flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full hover:bg-emerald-100 border border-emerald-200 transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Codebase Summary
                    </button>
                  </div>
                )}
                
                <form onSubmit={handleAsk} className="relative flex items-center">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask about the architecture, routing, or dependencies..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-full pl-6 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    disabled={!collectionName}
                  />
                  <button 
                    type="submit"
                    disabled={!question || isAsking || !collectionName}
                    className="absolute right-2 bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          )}

          {/* Tab 2: Semantic Search */}
          {activeTab === 'search' && (
            <div className="flex-1 overflow-hidden">
               <CodeSearch collectionName={collectionName} />
            </div>
          )}

          {/* Tab 3: Dependency Map */}
          {activeTab === 'map' && (
            <div className="flex-1 w-full h-full p-2 bg-slate-50 flex overflow-hidden">
               <DependencyMap collectionName={collectionName} />
            </div>
          )}

        </div>
      </main>
    </div>
  );
}