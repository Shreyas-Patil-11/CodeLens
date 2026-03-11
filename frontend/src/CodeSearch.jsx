import React, { useState } from 'react';
import axios from 'axios';
import { Search, Loader2, FileCode2 } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function CodeSearch({ collectionName }) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query || isSearching || !collectionName) return;

    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/search', {
        query: query,
        collection_name: collectionName
      });
      setResults(res.data.results || []);
    } catch (err) {
      console.error("Search failed:", err);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Helper to guess language for syntax highlighting based on file extension
  const getLanguage = (filePath) => {
    const ext = filePath.split('.').pop().toLowerCase();
    const map = { js: 'javascript', jsx: 'jsx', ts: 'typescript', tsx: 'tsx', py: 'python', json: 'json' };
    return map[ext] || 'javascript';
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Search Bar */}
      <div className="p-6 border-b border-gray-100 bg-slate-50">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-600" />
          Semantic Code Search
        </h2>
        <form onSubmit={handleSearch} className="relative flex items-center max-w-3xl">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., 'Where is the database connection initialized?' or 'authentication logic'"
            className="w-full bg-white border border-gray-300 rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            disabled={!collectionName}
          />
          <button 
            type="submit"
            disabled={!query || isSearching || !collectionName}
            className="absolute right-2 text-gray-400 hover:text-blue-600 p-2 disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="w-5 h-5 animate-spin text-blue-600" /> : <Search className="w-5 h-5" />}
          </button>
        </form>
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
        {!hasSearched && !isSearching && (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
            <FileCode2 className="w-12 h-12 text-gray-300" />
            <p>Search by concepts or features, not just exact keywords.</p>
          </div>
        )}

        {hasSearched && !isSearching && results.length === 0 && (
          <div className="text-center text-gray-500 py-10">No matching code found for this query.</div>
        )}

        {results.map((res, idx) => {
          const fileName = res.file_path.split(/[\\/]/).pop();
          return (
            <div key={idx} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-gray-700 flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-blue-500" />
                  {fileName}
                </span>
                <span className="text-xs text-gray-400 font-mono truncate max-w-[50%] relative group cursor-help">
                  {res.file_path}
                </span>
              </div>
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={getLanguage(fileName)}
                customStyle={{ margin: 0, padding: '1rem', fontSize: '13px', maxHeight: '400px' }}
              >
                {res.snippet}
              </SyntaxHighlighter>
            </div>
          );
        })}
      </div>
    </div>
  );
}