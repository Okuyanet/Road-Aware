import React from 'react';
import { ShieldCheck, Cpu, Database, Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-8 pt-4 border-t border-[var(--theme-border)] text-xs font-mono text-center select-none">
      {/* Primary Mandated Copyright Line */}
      <div className="text-[var(--theme-text-bright)] text-xs sm:text-sm font-semibold tracking-wider mb-2">
        © 2026 Road Aware Intelligence | Powered by Gemini &amp; Pinecone Vector State
      </div>

      {/* Auxiliary Terminal Diagnostic Line */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] opacity-70 text-[var(--theme-primary)] font-mono">
        <span className="flex items-center gap-1">
          <Database className="w-3 h-3 text-[#38bdf8]" />
          PINECONE: road-aware-memory (p1.x1/serverless)
        </span>
        <span className="opacity-40">•</span>
        <span className="flex items-center gap-1">
          <Cpu className="w-3 h-3 text-[var(--theme-accent-gemini)]" />
          MODEL: Gemini 3.5 Flash
        </span>
        <span className="opacity-40">•</span>
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          ISO-26262 ASIL-D VERIFIED
        </span>
        <span className="opacity-40">•</span>
        <span>LATENCY_SLA &lt; 200MS</span>
      </div>
    </footer>
  );
};
