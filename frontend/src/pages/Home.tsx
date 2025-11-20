import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Send, Loader2, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ContextItem {
  page_number: number;
  sentence_chunk: string;
}

interface AskResponse {
  answer: string;
  contexts: ContextItem[];
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const containerRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(containerRef.current, 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );
  }, []);

  useEffect(() => {
    if (result && resultRef.current) {
      gsap.fromTo(resultRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }
  }, [result]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query, top_k: 5 }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to fetch answer');
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="space-y-12">
      <div className="space-y-4 text-center mt-12 mb-16">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-zinc-900">
          Ask the Doc.
        </h1>
        <p className="text-zinc-500 text-lg max-w-xl mx-auto">
          Retrieval Augmented Generation powered by Gemini. 
          Upload a PDF (backend) and ask anything.
        </p>
      </div>

      <form onSubmit={handleAsk} className="relative max-w-2xl mx-auto group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-400">
          <Search size={20} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="How does saliva help with digestion?"
          className="w-full pl-12 pr-14 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:bg-white transition-all shadow-sm hover:shadow-md"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center text-sm">
          {error}
        </div>
      )}

      {result && (
        <div ref={resultRef} className="space-y-8 max-w-3xl mx-auto border-t border-zinc-100 pt-12">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Answer</h3>
            <div className="prose prose-zinc max-w-none text-lg leading-relaxed text-zinc-800">
              {result.answer}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Sources</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {result.contexts.map((ctx, i) => (
                <div key={i} className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 text-sm text-zinc-600 hover:border-zinc-300 transition-colors">
                  <div className="mb-2 font-medium text-zinc-900">Page {ctx.page_number}</div>
                  <p className="line-clamp-3 opacity-80">{ctx.sentence_chunk}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
