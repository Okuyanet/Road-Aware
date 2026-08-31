import React, { useState } from 'react';
import { ApiDecisionResponse } from '../types';
import { terminalAudio } from '../utils/audio';
import { Code, Copy, Check, Download, Layers, ShieldCheck, Zap, Activity } from 'lucide-react';

interface ApiOutputConsoleProps {
  decision: ApiDecisionResponse | null;
  isExecuting: boolean;
}

export const ApiOutputConsole: React.FC<ApiOutputConsoleProps> = ({
  decision,
  isExecuting,
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'HIGHLIGHTED' | 'RAW' | 'SUMMARY'>('HIGHLIGHTED');

  const copyJson = () => {
    if (!decision) return;
    terminalAudio.playKeyClick();
    navigator.clipboard.writeText(JSON.stringify(decision, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJson = () => {
    if (!decision) return;
    terminalAudio.playKeyClick();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(decision, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `road_aware_decision_${decision.decision_id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Syntax highlighting helper for JSON
  const renderHighlightedJson = (json: unknown): React.ReactNode => {
    const formatted = JSON.stringify(json, null, 2);
    const lines = formatted.split('\n');

    return (
      <div className="font-mono text-xs leading-relaxed">
        {lines.map((line, idx) => {
          // Tokenize line
          let renderedLine: React.ReactNode = line;

          // Key-Value match regex
          const keyValMatch = line.match(/^(\s*)(".*?")(\s*:\s*)(.*)$/);
          if (keyValMatch) {
            const [, indent, key, colon, value] = keyValMatch;
            
            // Highlight value based on type
            let valElement: React.ReactNode = value;
            if (value.startsWith('"')) {
              // String
              const isUrgent = value.includes('IMMEDIATE') || value.includes('CRITICAL') || value.includes('URGENT');
              const isPinecone = value.includes('CLUSTER_') || value.includes('road-aware-memory');
              valElement = (
                <span className={isUrgent ? 'text-[#b91c1c] font-bold' : isPinecone ? 'text-[#0369a1] font-bold' : 'text-[#854d0e] font-bold'}>
                  {value}
                </span>
              );
            } else if (value.match(/^-?\d+(\.\d+)?/)) {
              // Number
              valElement = <span className="text-[#0284c7] font-bold">{value}</span>;
            } else if (value.startsWith('true') || value.startsWith('false')) {
              // Boolean
              valElement = <span className="text-[#6b21a8] font-bold">{value}</span>;
            } else if (value.startsWith('null')) {
              valElement = <span className="text-[#524f46] italic">{value}</span>;
            }

            renderedLine = (
              <>
                <span>{indent}</span>
                <span className="text-[var(--theme-primary)] font-bold">{key}</span>
                <span className="text-[var(--theme-text-muted)] font-semibold">{colon}</span>
                {valElement}
              </>
            );
          } else {
            // Brackets, braces, array items
            if (line.trim().startsWith('"')) {
              renderedLine = <span className="text-[#854d0e] font-bold">{line}</span>;
            } else {
              renderedLine = <span className="text-[var(--theme-text-muted)] font-bold">{line}</span>;
            }
          }

          return (
            <div key={idx} className="flex hover:bg-[var(--theme-panel-surface)] py-0.5">
              <span className="w-8 select-none text-right pr-3 text-[10px] text-[var(--theme-text-muted)] font-semibold">
                {idx + 1}
              </span>
              <div className="flex-1 whitespace-pre-wrap break-all text-[var(--theme-text-main)] font-semibold">{renderedLine}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="term-box border-2 border-[var(--theme-border)] flex flex-col h-full rounded-xs overflow-hidden bg-[var(--theme-panel-bg)] shadow-xs">
      {/* Header Bar */}
      <div className="bg-[var(--theme-panel-header)] border-b border-[var(--theme-border)] px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs select-none">
        <div className="flex items-center gap-2 font-mono">
          <Code className="w-4 h-4 text-[var(--theme-primary)]" />
          <span className="font-extrabold tracking-wider bg-[var(--theme-neon-bg)] text-[var(--theme-neon-text)] px-2 py-0.5 rounded-xs border border-[var(--theme-neon)]">
            TERMINAL 02 :: API OUTPUT [200 OK]
          </span>
          {decision && (
            <span className="text-[10px] bg-[var(--theme-primary-faint)] border border-[var(--theme-border-bright)] text-[var(--theme-primary)] px-2 py-0.5 font-mono font-bold rounded-xs">
              ID: {decision.decision_id}
            </span>
          )}
        </div>

        {/* View Mode & Actions */}
        <div className="flex items-center gap-1.5 text-[10px]">
          <button
            onClick={() => {
              terminalAudio.playKeyClick();
              setViewMode('HIGHLIGHTED');
            }}
            className={`px-1.5 py-0.5 font-mono border transition-colors ${
              viewMode === 'HIGHLIGHTED'
                ? 'border-[var(--theme-button-bg)] bg-[var(--theme-button-bg)] text-[var(--theme-button-text)] font-bold'
                : 'border-[var(--theme-border)] text-[var(--theme-text-muted)] bg-[var(--theme-panel-bg)] hover:border-[var(--theme-border-bright)]'
            }`}
          >
            SYNTAX_JSON
          </button>
          <button
            onClick={() => {
              terminalAudio.playKeyClick();
              setViewMode('SUMMARY');
            }}
            className={`px-1.5 py-0.5 font-mono border transition-colors ${
              viewMode === 'SUMMARY'
                ? 'border-[var(--theme-button-bg)] bg-[var(--theme-button-bg)] text-[var(--theme-button-text)] font-bold'
                : 'border-[var(--theme-border)] text-[var(--theme-text-muted)] bg-[var(--theme-panel-bg)] hover:border-[var(--theme-border-bright)]'
            }`}
          >
            ACTION_HUD
          </button>
          <button
            onClick={() => {
              terminalAudio.playKeyClick();
              setViewMode('RAW');
            }}
            className={`px-1.5 py-0.5 font-mono border transition-colors ${
              viewMode === 'RAW'
                ? 'border-[var(--theme-button-bg)] bg-[var(--theme-button-bg)] text-[var(--theme-button-text)] font-bold'
                : 'border-[var(--theme-border)] text-[var(--theme-text-muted)] bg-[var(--theme-panel-bg)] hover:border-[var(--theme-border-bright)]'
            }`}
          >
            RAW
          </button>

          <button
            onClick={copyJson}
            disabled={!decision}
            className="ml-1.5 border border-[var(--theme-border-bright)] px-2 py-0.5 hover:border-[var(--theme-primary)] bg-[var(--theme-panel-bg)] text-[var(--theme-text-bright)] transition-colors flex items-center gap-1 disabled:opacity-40 font-bold rounded-xs"
            title="Copy API Output JSON"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
            <span className="hidden md:inline font-bold">{copied ? 'COPIED' : 'COPY'}</span>
          </button>

          <button
            onClick={downloadJson}
            disabled={!decision}
            className="border border-[var(--theme-border-bright)] px-1.5 py-0.5 hover:border-[var(--theme-primary)] bg-[var(--theme-panel-bg)] text-[var(--theme-text-bright)] transition-colors flex items-center gap-1 disabled:opacity-40 rounded-xs"
            title="Download Decision JSON"
          >
            <Download className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Screen Area */}
      <div className="flex-1 p-3.5 overflow-y-auto colab-console-font min-h-[340px] max-h-[500px] bg-[var(--theme-code-bg)] select-text">
        {isExecuting && !decision ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="flex items-center gap-2 text-[var(--theme-primary)] font-bold text-sm tracking-widest animate-pulse">
              <Activity className="w-4 h-4 animate-spin text-[var(--theme-primary)]" />
              <span>[ SYNTHESIZING AGENT DECISION PAYLOAD... ]</span>
            </div>
            <p className="text-[12px] text-[var(--theme-text-muted)] font-medium">
              Evaluating vector cosine distances and Gemini 3.5 spatial safety rules...
            </p>
          </div>
        ) : !decision ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 select-none font-mono">
            <div className="text-[var(--theme-neon)] text-xs sm:text-sm font-bold tracking-widest flex items-center justify-center gap-2">
              <span>[ SYSTEM READY :: STANDBY FOR EXECUTION ]</span>
              <span className="inline-block w-2.5 h-4 bg-[var(--theme-neon)] animate-term-blink"></span>
            </div>
          </div>
        ) : viewMode === 'SUMMARY' ? (
          /* Executive Action HUD View */
          <div className="space-y-4 animate-fadeIn">
            {/* Top Directive Card */}
            <div className="p-3 border-2 border-[var(--theme-border-bright)] bg-[var(--theme-panel-surface)] rounded-xs shadow-2xs">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--theme-accent-sepia)]">AGENT ACTION DIRECTIVE</span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-xs ${
                    decision.action_plan.urgency === 'HIGH'
                      ? 'bg-red-100 border border-red-400 text-red-900 font-bold animate-pulse'
                      : decision.action_plan.urgency === 'MEDIUM'
                      ? 'bg-amber-100 border border-amber-400 text-amber-900 font-bold'
                      : 'bg-emerald-100 border border-emerald-400 text-emerald-900 font-bold'
                  }`}
                >
                  URGENCY: {decision.action_plan.urgency}
                </span>
              </div>
              <div className="text-base sm:text-lg font-black text-[var(--theme-primary)] tracking-wider">
                ► {decision.action_plan.directive}
              </div>
              <div className="mt-2 p-2 bg-[var(--theme-panel-bg)] border border-[var(--theme-border)] text-xs text-[var(--theme-text-bright)] font-bold rounded-xs">
                HUD INSTRUCTION: &quot;{decision.action_plan.driver_hud_instruction}&quot;
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-[var(--theme-panel-surface)] border border-[var(--theme-border)] rounded-xs">
                <div className="text-[10px] font-bold text-[var(--theme-text-muted)] mb-1">ASSIGNED ROUTE:</div>
                <div className="font-bold text-[var(--theme-text-bright)] text-[13px]">
                  {decision.action_plan.assigned_diversion_route}
                </div>
                <div className="text-[11px] font-bold text-emerald-800 mt-1">
                  ETA DELTA: {decision.action_plan.eta_delta_minutes > 0 ? `+${decision.action_plan.eta_delta_minutes}` : decision.action_plan.eta_delta_minutes} min
                </div>
              </div>

              <div className="p-3 bg-[var(--theme-panel-surface)] border border-[var(--theme-border)] rounded-xs">
                <div className="text-[10px] font-bold text-[var(--theme-text-muted)] mb-1">PINECONE VECTOR MEMORY:</div>
                <div className="font-bold text-[#0369a1] text-[13px]">
                  {decision.vector_memory_retrieval.matched_cluster_id}
                </div>
                <div className="text-[11px] font-semibold text-[var(--theme-text-main)] mt-1">
                  Similarity: {(decision.vector_memory_retrieval.cosine_similarity * 100).toFixed(2)}% | Cases: {decision.vector_memory_retrieval.historical_cases_count}
                </div>
              </div>
            </div>

            {/* Reasoning Rationale */}
            <div className="p-3 bg-[var(--theme-panel-surface)] border border-[var(--theme-border)] text-xs rounded-xs">
              <div className="text-[10px] font-bold text-[var(--theme-accent-sepia)] uppercase mb-1">GEMINI REASONING RATIONALE:</div>
              <p className="text-[var(--theme-text-main)] leading-relaxed italic font-semibold text-[12px]">
                &quot;{decision.gemini_reasoning_evaluation.decision_rationale}&quot;
              </p>
            </div>
          </div>
        ) : viewMode === 'RAW' ? (
          <pre className="text-[var(--theme-text-main)] font-semibold whitespace-pre-wrap break-all text-xs">
            {JSON.stringify(decision, null, 2)}
          </pre>
        ) : (
          renderHighlightedJson(decision)
        )}
      </div>

      {/* Footer Metrics */}
      <div className="bg-[var(--theme-panel-header)] border-t border-[var(--theme-border)] px-3.5 py-1.5 flex flex-wrap items-center justify-between text-[10px] text-[var(--theme-text-main)] font-mono font-semibold gap-2">
        <div className="flex items-center gap-3">
          <span>STATUS: {decision ? '200 OK' : '---'}</span>
          <span className="hidden sm:inline opacity-40">|</span>
          <span>LATENCY: {decision ? `${decision.pipeline_meta.latency_ms}ms` : '---'}</span>
          <span className="hidden sm:inline opacity-40">|</span>
          <span>TOKENS: {decision ? `${decision.pipeline_meta.tokens_evaluated}` : '---'}</span>
        </div>
        <div className="text-[9px] text-[var(--theme-text-muted)] font-bold">
          FORMAT: application/json; charset=utf-8
        </div>
      </div>
    </div>
  );
};
