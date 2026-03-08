import { useState } from 'react';
import axios from 'axios';
import { Github, Send, Loader2, Database, Code2, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const API_BASE = 'http://127.0.0.1:8000/api';

export default function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestStatus, setIngestStatus] = useState(null);
  
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const handleIngest = async (e) => {
    e.preventDefault();
    if (!repoUrl) return;
    
    setIsIngesting(true);
    setIngestStatus(null);
    setChatHistory([]); // Clear chat for new repo
    
    try {
      const res = await axios.post(`${API_BASE}/ingest`, { repo_url: repoUrl });
      setIngestStatus({ type: 'success', message: res.data.message });
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
    if (!question || isAsking) return;

    const userMessage = { role: 'user', content: question };
    setChatHistory(prev => [...prev, userMessage]);
    setQuestion('');
    setIsAsking(true);

    try {
      const res = await axios.post(`${API_BASE}/ask`, { question: userMessage.content });
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* Top Navigation / Ingestion Bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Code2 className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Repo-Ramp</h1>
        </div>
        
        <form onSubmit={handleIngest} className="flex gap-3 w-1/2 max-w-2xl">
          <div className="relative flex-1">
            <Github className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="Paste GitHub Repository URL (.git)"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 flex flex-col gap-6">
        
        {/* Status Banner */}
        {ingestStatus && (
          <div className={`p-4 rounded-lg flex items-center gap-3 ${ingestStatus.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {ingestStatus.type === 'error' && <AlertCircle className="w-5 h-5" />}
            <p className="font-medium">{ingestStatus.message}</p>
          </div>
        )}

        {/* Chat Interface */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {chatHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                <Code2 className="w-16 h-16 text-gray-200" />
                <p className="text-lg font-medium">Ingest a repository to start chatting with the codebase.</p>
              </div>
            ) : (
              chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-5 ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : msg.role === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-50 border border-gray-100 text-gray-800 rounded-bl-none'}`}>
                    {/* Wrap the component in a div and apply the classes here instead */}
<div className="prose max-w-none text-sm leading-relaxed text-gray-800">
  <ReactMarkdown
    components={{
      code(props) {
        const { children, className, node, inline, ...rest } = props;
        const match = /language-(\w+)/.exec(className || '');
        
        return !inline && match ? (
          <div className="rounded-md overflow-hidden my-4 border border-gray-700 shadow-sm">
            <div className="bg-gray-800 text-gray-400 text-xs px-4 py-1.5 flex justify-between font-mono">
              <span>{match[1]}</span>
            </div>
            <SyntaxHighlighter
              {...rest}
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
              customStyle={{ margin: 0, padding: '1rem', background: '#1e1e1e' }}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          </div>
        ) : (
          <code {...rest} className="bg-gray-200 text-red-600 px-1.5 py-0.5 rounded-md text-sm font-mono">
            {children}
          </code>
        );
      }
    }}
  >
    {msg.content}
  </ReactMarkdown>
</div>
                    
                    {/* Render Sources if AI provided them */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Referenced Files:</p>
                        <ul className="space-y-1">
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

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <form onSubmit={handleAsk} className="relative flex items-center">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about the architecture, routing, or dependencies..."
                className="w-full bg-gray-50 border border-gray-200 rounded-full pl-6 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                disabled={!ingestStatus || ingestStatus.type === 'error'}
              />
              <button 
                type="submit"
                disabled={!question || isAsking || !ingestStatus || ingestStatus.type === 'error'}
                className="absolute right-2 bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}