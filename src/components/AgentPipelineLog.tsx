import React, { useRef, useEffect, useState } from 'react';
import { LogStep, LogLevel } from '../types';
import { terminalAudio } from '../utils/audio';
import { Copy, Check, Terminal, Filter, ArrowDownCircle, ShieldCheck } from 'lucide-react';

interface AgentPipelineLogProps {
  logs: LogStep[];
  isStreaming: boolean;
  activeScenarioName: string;
}

export const AgentPipelineLog: React.FC<AgentPipelineLogProps> = ({
  logs,
  isStreaming,
  activeScenarioName,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'INGEST' | 'PINECONE' | 'GEMINI' | 'ROUTING'>('ALL');
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const copyAllLogs = () => {
    terminalAudio.playKeyClick();
    const text = logs
      .map(
        (l) =>
          `[${l.timestamp}] [${l.level.padEnd(9, ' ')}] ${l.message} ${
            l.details ? JSON.stringify(l.details) : ''
          }`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case 'PINECONE':
        return 'text-[#0369a1] border-[#0369a1]/40 bg-[#0369a1]/10 font-bold';
      case 'GEMINI':
        return 'text-[#6b21a8] border-[#6b21a8]/40 bg-[#6b21a8]/10 font-bold';
      case 'TELEMETRY':
        return 'text-[#92400e] border-[#92400e]/40 bg-[#92400e]/10 font-bold';
      case 'ROUTING':
        return 'text-[var(--theme-primary)] border-[var(--theme-primary)]/40 bg-[var(--theme-primary-faint)] font-bold';
      case 'WARN':
        return 'text-[#b91c1c] border-[#b91c1c]/40 bg-[#b91c1c]/10 font-bold';
      case 'SUCCESS':
        return 'text-[var(--theme-primary)] font-bold';
      case 'SYS':
        return 'text-[var(--theme-primary)] font-semibold';
      default:
        return 'text-[var(--theme-text-bright)] font-semibold';
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filter === 'ALL') return true;
    if (filter === 'INGEST') return log.level === 'TELEMETRY' || log.message.toLowerCase().includes('telemetry');
    if (filter === 'PINECONE') return log.level === 'PINECONE' || log.message.includes('Pinecone');
    if (filter === 'GEMINI') return log.level === 'GEMINI' || log.message.includes('Gemini');
    if (filter === 'ROUTING') return log.level === 'ROUTING' || log.message.includes('Decision') || log.level === 'SUCCESS';
    return true;
  });

  return (
    <div className="term-box border-2 border-[var(--theme-border)] flex flex-col h-full rounded-xs overflow-hidden bg-[var(--theme-panel-bg)] shadow-xs">
      {/* Console Header Bar */}
      <div className="bg-[var(--theme-panel-header)] border-b border-[var(--theme-border)] px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs select-none">
        <div className="flex items-center gap-2 font-mono">
          <Terminal className="w-4 h-4 text-[var(--theme-primary)]" />
          <span className="font-extrabold tracking-wider bg-[var(--theme-neon-bg)] text-[var(--theme-neon-text)] px-2 py-0.5 rounded-xs border border-[var(--theme-neon)]">
            TERMINAL 01 :: PIPELINE LOG
          </span>
          {isStreaming && (
            <span className="inline-flex items-center gap-1 text-[10px] text-[var(--theme-button-text)] bg-[var(--theme-primary)] px-1.5 py-0.5 font-bold animate-pulse rounded-xs">
              STREAMING
            </span>
          )}
        </div>

        {/* Filter Pills & Actions */}
        <div className="flex items-center gap-1.5 text-[10px]">
          <span className="text-[var(--theme-text-muted)] hidden sm:inline mr-1 font-bold">FILTER:</span>
          {(['ALL', 'INGEST', 'PINECONE', 'GEMINI', 'ROUTING'] as const).map((f) => (
            <button
              key={f}
              onClick={() => {
                terminalAudio.playKeyClick();
                setFilter(f);
              }}
              className={`px-1.5 py-0.5 font-mono border transition-colors ${
                filter === f
                  ? 'border-[var(--theme-button-bg)] bg-[var(--theme-button-bg)] text-[var(--theme-button-text)] font-bold'
                  : 'border-[var(--theme-border)] text-[var(--theme-text-muted)] bg-[var(--theme-panel-bg)] hover:border-[var(--theme-border-bright)]'
              }`}
            >
              {f}
            </button>
          ))}

          <button
            onClick={copyAllLogs}
            disabled={logs.length === 0}
            className="ml-2 border border-[var(--theme-border-bright)] px-2 py-0.5 hover:border-[var(--theme-primary)] bg-[var(--theme-panel-bg)] text-[var(--theme-text-bright)] transition-colors flex items-center gap-1 disabled:opacity-40 font-bold rounded-xs"
            title="Copy all pipeline logs"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
            <span className="hidden md:inline font-bold">{copied ? 'COPIED' : 'COPY'}</span>
          </button>
        </div>
      </div>

      {/* Terminal Content Screen */}
      <div
        ref={containerRef}
        className="flex-1 p-3.5 overflow-y-auto colab-console-font space-y-2 min-h-[340px] max-h-[500px] bg-[var(--theme-code-bg)] select-text"
      >
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 select-none font-mono">
            <div className="text-[var(--theme-neon)] text-xs sm:text-sm font-bold tracking-widest flex items-center justify-center gap-2">
              <span>[ SYSTEM READY :: STANDBY FOR EXECUTION ]</span>
              <span className="inline-block w-2.5 h-4 bg-[var(--theme-neon)] animate-term-blink"></span>
            </div>
          </div>
        ) : (
          <>
            {filteredLogs.map((log, index) => {
              const isPinecone = log.level === 'PINECONE' || log.message.includes('[Pinecone]');
              const isGemini = log.level === 'GEMINI' || log.message.includes('Gemini');
              const isIngest = log.level === 'TELEMETRY' || log.message.includes('telemetry');

              return (
                <div
                  key={log.id || index}
                  className={`p-1.5 rounded-xs transition-all ${
                    log.highlight
                      ? 'bg-[var(--theme-panel-surface)] border-l-3 border-[var(--theme-primary)] shadow-2xs pl-2.5'
                      : 'hover:bg-[var(--theme-panel-surface)]'
                  }`}
                >
                  {/* Line Header */}
                  <div className="flex items-start gap-2 text-[11px] leading-relaxed">
                    <span className="text-[var(--theme-text-muted)] select-none text-[10px] min-w-[24px]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[var(--theme-text-muted)] text-[10px] select-none font-bold">
                      [{log.timestamp}]
                    </span>
                    <span
                      className={`px-1.5 py-0.2 text-[9px] uppercase border font-bold ${getLevelColor(
                        log.level
                      )}`}
                    >
                      {log.tag || log.level}
                    </span>
                    <span
                      className={`flex-1 font-mono break-words ${
                        isPinecone
                          ? 'text-[#0369a1] font-bold'
                          : isGemini
                          ? 'text-[#6b21a8] font-bold'
                          : isIngest
                          ? 'text-[#92400e] font-bold'
                          : log.level === 'WARN'
                          ? 'text-[#b91c1c] font-bold'
                          : 'text-[var(--theme-text-main)] font-semibold'
                      }`}
                    >
                      {log.message}
                    </span>
                  </div>

                  {/* Optional JSON / Key-Value Details */}
                  {log.details && (
                    <div className="mt-1.5 ml-14 p-2 bg-[var(--theme-panel-surface)] border border-[var(--theme-border)] text-[11px] space-y-0.5 text-[var(--theme-text-main)] font-mono rounded-xs">
                      {Object.entries(log.details).map(([k, v]) => (
                        <div key={k} className="flex flex-wrap gap-1.5">
                          <span className="text-[var(--theme-text-muted)] font-bold">{k}:</span>
                          <span className="text-[var(--theme-text-bright)] font-bold">
                            {Array.isArray(v) ? v.join(', ') : String(v)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Live Streaming Indicator Cursor */}
            {isStreaming && (
              <div className="flex items-center gap-2 pl-8 pt-1 text-[11px] text-[var(--theme-primary)] font-bold">
                <span className="inline-block w-2.5 h-4 bg-[var(--theme-primary)] animate-term-blink"></span>
                <span className="italic text-[10px]">Processing neural token vectors...</span>
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Terminal Footer Status Bar */}
      <div className="bg-[var(--theme-panel-header)] border-t border-[var(--theme-border)] px-3.5 py-1.5 flex items-center justify-between text-[10px] text-[var(--theme-text-main)] font-mono font-semibold">
        <div className="flex items-center gap-3">
          <span>LINES: {filteredLogs.length}/{logs.length}</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline text-emerald-400">PINECONE_STATE: CONNECTED</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline text-purple-400">GEMINI_REASONER: READY</span>
        </div>
        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className={`flex items-center gap-1 hover:text-[var(--theme-primary)] ${
            autoScroll ? 'text-[var(--theme-primary)] font-bold' : 'opacity-60'
          }`}
          title="Toggle Auto-Scroll"
        >
          <ArrowDownCircle className="w-3 h-3" />
          <span>AUTOSCROLL: {autoScroll ? 'ON' : 'OFF'}</span>
        </button>
      </div>
    </div>
  );
};
