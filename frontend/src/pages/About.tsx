import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Github, FileText, Cpu } from 'lucide-react';

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".anim-item", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="max-w-2xl mx-auto space-y-16 py-12">
      <div className="space-y-6 anim-item">
        <h1 className="text-4xl font-bold tracking-tight">About This Project</h1>
        <p className="text-xl text-zinc-600 leading-relaxed">
          This is a minimalistic Retrieval-Augmented Generation (RAG) system designed to demonstrate how LLMs can answer questions based on specific documents.
        </p>
      </div>

      <div className="space-y-8 anim-item">
        <h2 className="text-2xl font-semibold">How it works</h2>
        <div className="grid gap-6">
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-zinc-100 rounded-lg">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="font-medium text-lg">1. Ingestion</h3>
              <p className="text-zinc-500 mt-1">The PDF document is processed, split into chunks, and converted into vector embeddings.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-zinc-100 rounded-lg">
              <SearchIcon size={24} />
            </div>
            <div>
              <h3 className="font-medium text-lg">2. Retrieval</h3>
              <p className="text-zinc-500 mt-1">When you ask a question, we find the most relevant chunks from the document using semantic search.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-zinc-100 rounded-lg">
              <Cpu size={24} />
            </div>
            <div>
              <h3 className="font-medium text-lg">3. Generation</h3>
              <p className="text-zinc-500 mt-1">The relevant context and your question are sent to Google's Gemini model to generate a precise answer.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 anim-item pt-8 border-t border-zinc-100">
        <h2 className="text-2xl font-semibold">Links</h2>
        <div className="flex gap-4">
          <a 
            href="https://github.com/UdayKhare09/CodeSpire" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <Github size={20} />
            <span>GitHub Repository</span>
          </a>
        </div>
      </div>
    </div>
  );
}

function SearchIcon({ size }: { size: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}
