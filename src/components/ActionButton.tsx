import React from 'react';
import { terminalAudio } from '../utils/audio';
import { Play, RotateCcw, Zap, Clock, Terminal } from 'lucide-react';

interface ActionButtonProps {
  isExecuting: boolean;
  onExecute: () => void;
  onReset: () => void;
  hasOutput: boolean;
  streamSpeed: 'realtime' | 'fast' | 'instant';
  setStreamSpeed: (speed: 'realtime' | 'fast' | 'instant') => void;
  onOpenModal: () => void;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  isExecuting,
  onExecute,
  onReset,
  hasOutput,
  streamSpeed,
  setStreamSpeed,
}) => {
  const handleClick = () => {
    if (isExecuting) return;
    terminalAudio.playExecuteSound();
    onExecute();
  };

  const handleReset = () => {
    terminalAudio.playKeyClick();
    onReset();
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4 p-3 bg-[var(--theme-panel-surface)] border border-[var(--theme-border)] rounded-xs shadow-2xs">
      {/* Primary Terminal Action Command Button */}
      <div className="flex-1 flex items-center gap-2 flex-wrap">
        <button
          onClick={handleClick}
          disabled={isExecuting}
          className={`flex-1 min-w-[240px] group relative flex items-center justify-center gap-3 py-3.5 px-6 text-sm sm:text-base font-extrabold font-mono tracking-wider transition-all select-none rounded-xs shadow-md ${
            isExecuting
              ? 'bg-[var(--theme-primary-faint)] text-[var(--theme-primary)] border-2 border-[var(--theme-primary)] cursor-wait'
              : 'bg-[var(--theme-neon-bg)] text-white border-2 border-[var(--theme-neon)] hover:brightness-110 hover:shadow-[0_0_20px_var(--theme-neon)] active:scale-[0.99] cursor-pointer'
          }`}
          title="Execute Traffic Intelligence Reasoning Pipeline"
        >
          {isExecuting ? (
            <span className="flex items-center gap-2 text-white font-extrabold">
              <span className="inline-block animate-spin">⠋</span>
              <span>EXECUTING /traffic/analyze PIPELINE...</span>
              <span className="inline-block w-2 h-4 bg-current animate-term-blink"></span>
            </span>
          ) : (
            <span className="flex items-center gap-2 text-white font-extrabold">
              <span className="text-lg font-black">&gt;</span>
              <span className="tracking-widest">EXECUTE /traffic/analyze</span>
              <span className="inline-block w-2.5 h-4 bg-current animate-term-blink ml-1"></span>
            </span>
          )}
        </button>

        {/* Reset / Replay Button */}
        {hasOutput && !isExecuting && (
          <button
            onClick={handleReset}
            className="border-2 border-[var(--theme-border-bright)] px-4 py-3.5 hover:border-[var(--theme-primary)] text-[var(--theme-text-bright)] hover:text-[var(--theme-primary)] bg-[var(--theme-panel-bg)] transition-colors rounded-xs shadow-2xs font-mono font-bold flex items-center gap-2 text-xs"
            title="Reset & Clear Console"
          >
            <RotateCcw className="w-4 h-4 text-[var(--theme-primary)]" />
            <span>[ RESET ]</span>
          </button>
        )}
      </div>

      {/* Stream Simulation Speed Control */}
      <div className="flex items-center justify-end gap-1.5 text-xs text-[var(--theme-text-bright)] border-t sm:border-t-0 sm:border-l border-[var(--theme-border)] pt-2 sm:pt-0 sm:pl-3">
        <span className="font-bold text-[10px] uppercase font-mono mr-1 text-[var(--theme-text-muted)]">STREAM SPEED:</span>
        <button
          onClick={() => {
            terminalAudio.playKeyClick();
            setStreamSpeed('fast');
          }}
          className={`px-2 py-1 text-[11px] font-mono border transition-colors rounded-xs ${
            streamSpeed === 'fast'
              ? 'border-[var(--theme-button-bg)] bg-[var(--theme-button-bg)] text-[var(--theme-button-text)] font-bold'
              : 'border-[var(--theme-border)] bg-[var(--theme-panel-bg)] text-[var(--theme-text-main)] hover:border-[var(--theme-border-bright)]'
          }`}
          title="Fast stream (40ms per event)"
        >
          FAST (40ms)
        </button>
        <button
          onClick={() => {
            terminalAudio.playKeyClick();
            setStreamSpeed('realtime');
          }}
          className={`px-2 py-1 text-[11px] font-mono border transition-colors rounded-xs ${
            streamSpeed === 'realtime'
              ? 'border-[var(--theme-button-bg)] bg-[var(--theme-button-bg)] text-[var(--theme-button-text)] font-bold'
              : 'border-[var(--theme-border)] bg-[var(--theme-panel-bg)] text-[var(--theme-text-main)] hover:border-[var(--theme-border-bright)]'
          }`}
          title="Realistic agent pace (120ms per step)"
        >
          REALTIME
        </button>
        <button
          onClick={() => {
            terminalAudio.playKeyClick();
            setStreamSpeed('instant');
          }}
          className={`px-2 py-1 text-[11px] font-mono border transition-colors rounded-xs ${
            streamSpeed === 'instant'
              ? 'border-[var(--theme-button-bg)] bg-[var(--theme-button-bg)] text-[var(--theme-button-text)] font-bold'
              : 'border-[var(--theme-border)] bg-[var(--theme-panel-bg)] text-[var(--theme-text-main)] hover:border-[var(--theme-border-bright)]'
          }`}
          title="Instant output"
        >
          INSTANT
        </button>
      </div>
    </div>
  );
};
