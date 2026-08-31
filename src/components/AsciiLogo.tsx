import React from 'react';
import { TerminalTheme } from '../types';
import { terminalAudio } from '../utils/audio';
import { Volume2, VolumeX, Tv, Sparkles } from 'lucide-react';

interface AsciiLogoProps {
  theme: TerminalTheme;
  setTheme: (t: TerminalTheme) => void;
  crtEnabled: boolean;
  setCrtEnabled: (val: boolean) => void;
  audioEnabled: boolean;
  setAudioEnabled: (val: boolean) => void;
}

export const AsciiLogo: React.FC<AsciiLogoProps> = ({
  theme,
  setTheme,
  crtEnabled,
  setCrtEnabled,
  audioEnabled,
  setAudioEnabled,
}) => {
  // ASCII Banner for ROAD AWARE API
  const asciiArt = `
██████╗  ██████╗  █████╗ ██████╗      █████╗ ██╗    ██╗ █████╗ ██████╗ ███████╗    █████╗ ██████╗ ██╗
██╔══██╗██╔═══██╗██╔══██╗██╔══██╗    ██╔══██╗██║    ██║██╔══██╗██╔══██╗██╔════╝   ██╔══██╗██╔══██╗██║
██████╔╝██║   ██║███████║██║  ██║    ███████║██║ █╗ ██║███████║██████╔╝█████╗     ███████║██████╔╝██║
██╔══██╗██║   ██║██╔══██║██║  ██║    ██╔══██║██║███╗██║██╔══██║██╔══██╗██╔══╝     ██╔══██║██╔═══╝ ██║
██║  ██║╚██████╔╝██║  ██║██████╔╝    ██║  ██║╚███╔███╔╝██║  ██║██║  ██║███████╗   ██║  ██║██║     ██║
╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝     ╚═╝  ╚═╝ ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝   ╚═╝  ╚═╝╚═╝     ╚═╝
`.trim();

  const handleThemeChange = (newTheme: TerminalTheme) => {
    terminalAudio.playKeyClick();
    setTheme(newTheme);
  };

  const handleAudioToggle = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    terminalAudio.setEnabled(next);
    if (next) {
      terminalAudio.playSuccessChime();
    }
  };

  const handleCrtToggle = () => {
    terminalAudio.playKeyClick();
    setCrtEnabled(!crtEnabled);
  };

  return (
    <header className="border-b border-[var(--theme-border)] pb-4 mb-5 select-none">
      {/* Top Status Bar & Control Toggles */}
      <div className="flex flex-wrap items-center justify-between text-xs tracking-wider border-b border-[var(--theme-border)]/60 pb-2 mb-3 gap-2">
        <div className="flex items-center space-x-3 text-xs opacity-90">
          <span className="flex items-center gap-1.5 font-semibold">
            <span className="inline-block w-2 h-2 rounded-full bg-[var(--theme-primary)] animate-pulse"></span>
            [SYS_STATUS: ONLINE]
          </span>
          <span className="opacity-40">|</span>
          <span className="hidden sm:inline">HARNESS: v4.8.2-DEV_TEST</span>
          <span className="opacity-40 hidden sm:inline">|</span>
          <span className="text-[var(--theme-text-bright)]">TARGET: /traffic/analyze</span>
        </div>

        {/* Quick Toggles */}
        <div className="flex items-center gap-2">
          {/* Theme Selector */}
          <div className="flex items-center border border-[var(--theme-border)] px-1.5 py-0.5 rounded text-[11px] gap-1 bg-[var(--theme-panel-bg)]">
            <span className="opacity-60 text-[10px] mr-1 hidden md:inline">PALETTE:</span>
            <button
              onClick={() => handleThemeChange('eggshell')}
              className={`px-1.5 py-0.5 rounded font-mono text-[10px] transition-colors ${
                theme === 'eggshell' ? 'bg-[var(--theme-primary)] text-[var(--theme-bg)] font-bold' : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-primary)]'
              }`}
              title="Warm Pale Eggshell"
            >
              [EGGSHELL]
            </button>
            <button
              onClick={() => handleThemeChange('palegrey')}
              className={`px-1.5 py-0.5 rounded font-mono text-[10px] transition-colors ${
                theme === 'palegrey' ? 'bg-[var(--theme-primary)] text-[var(--theme-bg)] font-bold' : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-primary)]'
              }`}
              title="Pale Grey Clean Paper"
            >
              [PALE GREY]
            </button>
            <button
              onClick={() => handleThemeChange('warmparchment')}
              className={`px-1.5 py-0.5 rounded font-mono text-[10px] transition-colors ${
                theme === 'warmparchment' ? 'bg-[var(--theme-primary)] text-[var(--theme-bg)] font-bold' : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-primary)]'
              }`}
              title="Warm Bookish Parchment"
            >
              [PARCHMENT]
            </button>
          </div>

          {/* CRT Scanline Toggle */}
          <button
            onClick={handleCrtToggle}
            className={`flex items-center gap-1 border px-2 py-0.5 text-[11px] rounded transition-all ${
              crtEnabled
                ? 'border-[var(--theme-primary)] text-[var(--theme-primary)] bg-[var(--theme-primary-faint)]'
                : 'border-[var(--theme-border)] opacity-60 hover:opacity-100'
            }`}
            title="Toggle Retro CRT Scanlines"
          >
            <Tv className="w-3 h-3" />
            <span className="hidden sm:inline">CRT</span>
          </button>

          {/* Audio Feedback Toggle */}
          <button
            onClick={handleAudioToggle}
            className={`flex items-center gap-1 border px-2 py-0.5 text-[11px] rounded transition-all ${
              audioEnabled
                ? 'border-[var(--theme-primary)] text-[var(--theme-primary)] bg-[var(--theme-primary-faint)]'
                : 'border-[var(--theme-border)] opacity-50 hover:opacity-100'
            }`}
            title={audioEnabled ? 'Terminal Audio: Mute' : 'Terminal Audio: Unmute'}
          >
            {audioEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
            <span className="hidden sm:inline">{audioEnabled ? 'SFX:ON' : 'SFX:OFF'}</span>
          </button>
        </div>
      </div>

      {/* Main ASCII Artwork Banner */}
      <div className="relative overflow-x-auto text-center py-2 px-1">
        <pre className="font-mono text-[9px] sm:text-[11px] md:text-[13px] lg:text-[14px] leading-tight text-[var(--theme-primary)] term-glow inline-block whitespace-pre select-text font-bold tracking-tight">
          {asciiArt}
        </pre>
        <div className="mt-2 text-xs sm:text-sm tracking-widest uppercase font-extrabold text-[var(--theme-text-bright)] flex items-center justify-center gap-2 flex-wrap">
          <span className="bg-[var(--theme-neon-bg)] text-[var(--theme-neon-text)] px-3 py-1 font-mono font-extrabold rounded-xs border border-[var(--theme-neon)] shadow-sm">═╣ TRAFFIC INTELLIGENCE API TEST CONSOLE ╠═</span>
          <span className="text-[10px] border border-[var(--theme-border)] px-2 py-0.5 bg-[var(--theme-panel-surface)] text-[var(--theme-text-bright)] font-bold rounded-xs shadow-2xs">
            GENAI PIPELINE ENGINE
          </span>
        </div>
      </div>
    </header>
  );
};
