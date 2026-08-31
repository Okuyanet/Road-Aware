import React, { useState, useRef, useEffect } from 'react';
import { ScenarioKey, TerminalTheme } from '../types';
import { terminalAudio } from '../utils/audio';
import { Terminal, Send, HelpCircle } from 'lucide-react';

interface InteractiveCliPromptProps {
  onExecuteScenario: (key?: ScenarioKey) => void;
  onSelectScenario: (key: ScenarioKey) => void;
  onClear: () => void;
  onSetTheme: (theme: TerminalTheme) => void;
  onToggleCrt: (val?: boolean) => void;
  onToggleAudio: (val?: boolean) => void;
  currentScenario: ScenarioKey;
}

export const InteractiveCliPrompt: React.FC<InteractiveCliPromptProps> = ({
  onExecuteScenario,
  onSelectScenario,
  onClear,
  onSetTheme,
  onToggleCrt,
  onToggleAudio,
  currentScenario,
}) => {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [feedback, setFeedback] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = command.trim();
    if (!cmd) return;

    terminalAudio.playKeyClick();
    setHistory((prev) => [...prev, cmd]);
    setHistoryIdx(-1);
    setCommand('');

    const lower = cmd.toLowerCase();
    const parts = cmd.split(' ');
    const action = parts[0]?.toLowerCase();
    const arg = parts[1];

    if (action === 'help') {
      setFeedback(
        'COMMANDS: run [scenario] | scenario <A5|AMPLE|LOW> | theme <green|amber|cyan> | crt <on|off> | sfx <on|off> | clear | status'
      );
    } else if (action === 'run' || action === 'execute' || action === 'exec') {
      if (arg) {
        const matched = matchScenario(arg);
        if (matched) {
          onSelectScenario(matched);
          onExecuteScenario(matched);
          setFeedback(`Executing scenario: ${matched}`);
        } else {
          setFeedback(`Unknown scenario "${arg}". Options: A5_LAST_EXIT, AMPLE_DIVERSION, LOW_DIRECTION_CONFIDENCE`);
        }
      } else {
        onExecuteScenario();
        setFeedback(`Executing current scenario: ${currentScenario}`);
      }
    } else if (action === 'scenario' || action === 'select') {
      if (arg) {
        const matched = matchScenario(arg);
        if (matched) {
          onSelectScenario(matched);
          setFeedback(`Selected scenario: ${matched}`);
        } else {
          setFeedback(`Unknown scenario "${arg}". Try: a5, ample, low`);
        }
      } else {
        setFeedback(`Current scenario: ${currentScenario}`);
      }
    } else if (action === 'clear' || action === 'cls') {
      onClear();
      setFeedback('Console output buffers cleared.');
    } else if (action === 'theme') {
      if (arg === 'amber' || arg === 'green' || arg === 'cyan') {
        onSetTheme(arg as TerminalTheme);
        setFeedback(`Phosphor palette set to ${arg.toUpperCase()}`);
      } else {
        setFeedback('Available themes: green, amber, cyan');
      }
    } else if (action === 'crt') {
      if (arg === 'off' || arg === 'disable') {
        onToggleCrt(false);
        setFeedback('CRT scanline filter disabled');
      } else {
        onToggleCrt(true);
        setFeedback('CRT scanline filter enabled');
      }
    } else if (action === 'sfx' || action === 'audio') {
      if (arg === 'off' || arg === 'mute') {
        onToggleAudio(false);
        setFeedback('Audio feedback muted');
      } else {
        onToggleAudio(true);
        setFeedback('Audio feedback enabled');
      }
    } else if (action === 'status') {
      setFeedback('SYSTEM: ONLINE | PINECONE: 1.5M vectors (road-aware-memory) | GEMINI: 3.5-Flash active');
    } else {
      setFeedback(`Command not recognized: "${cmd}". Type "help" for syntax list.`);
    }
  };

  const matchScenario = (input: string): ScenarioKey | null => {
    const s = input.toUpperCase();
    if (s.includes('A5') || s.includes('EXIT')) return 'A5_LAST_EXIT';
    if (s.includes('AMPLE') || s.includes('DIVERSION')) return 'AMPLE_DIVERSION';
    if (s.includes('LOW') || s.includes('CONFIDENCE') || s.includes('TUNNEL')) return 'LOW_DIRECTION_CONFIDENCE';
    return null;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const nextIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(nextIdx);
        setCommand(history[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx !== -1) {
        const nextIdx = historyIdx + 1;
        if (nextIdx >= history.length) {
          setHistoryIdx(-1);
          setCommand('');
        } else {
          setHistoryIdx(nextIdx);
          setCommand(history[nextIdx]);
        }
      }
    }
  };

  return (
    <div className="mt-4 term-box p-2 bg-[var(--theme-panel-surface)] border border-[var(--theme-border)] rounded-xs shadow-2xs">
      <form onSubmit={handleSubmit} className="flex items-center gap-2 font-mono text-xs">
        <span className="text-[var(--theme-primary)] font-bold flex items-center gap-1 select-none pl-1">
          <Terminal className="w-3.5 h-3.5" />
          <span>roadaware@cli:~$</span>
        </span>
        <input
          ref={inputRef}
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type CLI command (e.g. 'run A5_LAST_EXIT', 'help', 'theme eggshell')..."
          className="flex-1 bg-transparent text-[var(--theme-text-main)] placeholder:text-[var(--theme-text-muted)] focus:outline-none font-mono text-xs font-semibold"
        />
        <button
          type="submit"
          className="px-2.5 py-1 border border-[var(--theme-border-bright)] hover:border-[var(--theme-primary)] text-[var(--theme-primary)] bg-[var(--theme-panel-bg)] text-[11px] font-mono font-bold transition-colors rounded-xs shadow-2xs"
          title="Submit CLI Command"
        >
          [ENTER]
        </button>
      </form>

      {feedback && (
        <div className="mt-1.5 pt-1.5 border-t border-[var(--theme-border)]/40 text-[10px] text-[var(--theme-text-bright)] font-mono flex items-center justify-between px-1">
          <span>&gt; {feedback}</span>
          <button
            onClick={() => setFeedback(null)}
            className="opacity-50 hover:opacity-100 text-[9px]"
          >
            [DISMISS]
          </button>
        </div>
      )}
    </div>
  );
};
