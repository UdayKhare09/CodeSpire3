import { useEffect, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Layout() {
  const lenisRef = useRef<Lenis | null>(null);
  const location = useLocation();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    // Reset scroll on route change
    lenisRef.current?.scrollTo(0, { immediate: true });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col font-sans text-zinc-900 bg-white selection:bg-zinc-900 selection:text-white">
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-6 flex justify-between items-center mix-blend-difference text-white">
        <Link to="/" className="text-xl font-bold tracking-tighter hover:opacity-70 transition-opacity">
          RAG.
        </Link>
        <nav className="flex gap-6 text-sm font-medium">
          <Link to="/" className="hover:underline underline-offset-4">Home</Link>
          <Link to="/about" className="hover:underline underline-offset-4">About</Link>
        </nav>
      </header>

      <main className="flex-grow pt-24 px-6 pb-12 w-full max-w-4xl mx-auto">
        <Outlet />
      </main>

      <footer className="px-6 py-8 text-center text-xs text-zinc-400 border-t border-zinc-100 mt-auto">
        <p>&copy; {new Date().getFullYear()} CodeSpire. Built with RAG & Gemini.</p>
      </footer>
    </div>
  );
}
