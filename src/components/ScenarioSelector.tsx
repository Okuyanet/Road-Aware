import React, { useState } from 'react';
import { ScenarioKey, ScenarioDefinition } from '../types';
import { SCENARIO_DEFINITIONS } from '../data/scenarios';
import { terminalAudio } from '../utils/audio';
import { ChevronDown, Database, Cpu, Eye, EyeOff, Radio } from 'lucide-react';

interface ScenarioSelectorProps {
  selectedScenario: ScenarioKey;
  onSelectScenario: (scenario: ScenarioKey) => void;
  disabled?: boolean;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  selectedScenario,
  onSelectScenario,
  disabled = false,
}) => {
  const [showPayload, setShowPayload] = useState(false);
  const currentDef: ScenarioDefinition = SCENARIO_DEFINITIONS[selectedScenario];

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    terminalAudio.playKeyClick();
    onSelectScenario(e.target.value as ScenarioKey);
  };

  const togglePayload = () => {
    terminalAudio.playKeyClick();
    setShowPayload(!showPayload);
  };

  return (
    <section className="term-box p-4 mb-4 rounded-sm border-2 border-[var(--theme-neon)] bg-[var(--theme-panel-surface)] shadow-md">
      {/* Header Label + Dropdown */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex-1">
          <label
            htmlFor="scenario-select"
            className="block text-xs font-black uppercase tracking-wider text-[var(--theme-neon)] bg-[var(--theme-panel-surface)] px-2.5 py-1.5 mb-2 rounded-xs border-2 border-[var(--theme-neon)] flex items-center justify-between shadow-xs"
          >
            <span className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[var(--theme-neon)] animate-pulse" />
              <span className="text-[var(--theme-neon)]">((•)) STEP 1: SELECT DRIVING SCENARIO</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-[var(--theme-neon)]">[READY FOR INGEST]</span>
          </label>
          
          <div className="relative">
            <select
              id="scenario-select"
              value={selectedScenario}
              onChange={handleSelect}
              disabled={disabled}
              className="w-full bg-[var(--theme-neon-bg)] text-white text-sm md:text-base font-mono border-2 border-[var(--theme-neon)] py-3 px-3.5 rounded-xs focus:outline-none focus:ring-2 focus:ring-white appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider font-extrabold shadow-md"
            >
              <option value="A5_LAST_EXIT" className="bg-[var(--theme-panel-bg)] text-[var(--theme-text-bright)] py-1.5 font-bold">
                A5_LAST_EXIT  » [EMERGENCY HIGHWAY SPILLBACK / 800M EXIT 14]
              </option>
              <option value="AMPLE_DIVERSION" className="bg-[var(--theme-panel-bg)] text-[var(--theme-text-bright)] py-1.5 font-bold">
                AMPLE_DIVERSION  » [UPSTREAM BOTTLENECK / 3 ARTERIAL BYPASSES]
              </option>
              <option value="LOW_DIRECTION_CONFIDENCE" className="bg-[var(--theme-panel-bg)] text-[var(--theme-text-bright)] py-1.5 font-bold">
                LOW_DIRECTION_CONFIDENCE  » [TUNNEL GPS DEGRADATION / DRIFT SUPPRESSION]
              </option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-white">
              <ChevronDown className="w-5 h-5 font-bold" />
            </div>
          </div>
          <div className="mt-1.5 text-[11px] text-[var(--theme-text-muted)] font-semibold flex items-center justify-between">
            <span>💡 Agent Goal: Cross-reference historical traffic memory in Pinecone with live route geometry to decide if/when to alert the driver.</span>
          </div>
        </div>

        {/* Quick Actions & Telemetry Inspector Toggle */}
        <div className="flex items-end self-end md:self-center">
          <button
            onClick={togglePayload}
            className="flex items-center gap-1.5 text-xs font-mono border border-[var(--theme-border-bright)] px-3.5 py-2.5 bg-[var(--theme-panel-bg)] hover:bg-[var(--theme-bg-subtle)] transition-colors text-[var(--theme-text-bright)] font-bold shadow-2xs rounded-xs"
            title="Inspect Raw Input Telemetry Packet"
          >
            {showPayload ? <EyeOff className="w-3.5 h-3.5 text-[var(--theme-accent-sepia)]" /> : <Eye className="w-3.5 h-3.5 text-[var(--theme-accent-sepia)]" />}
            <span>{showPayload ? '[ HIDE PAYLOAD ]' : '[ INSPECT PAYLOAD ]'}</span>
          </button>
        </div>
      </div>

      {/* Scenario Brief & Vector Metadata Grid */}
      <div className="mt-3 pt-3 border-t border-[var(--theme-border)] grid grid-cols-1 lg:grid-cols-3 gap-2.5 text-xs">
        {/* Scenario description */}
        <div className="lg:col-span-2 bg-[var(--theme-panel-surface)] p-3 border border-[var(--theme-border)] rounded-xs">
          <div className="text-[10px] uppercase font-bold tracking-widest mb-1 text-[var(--theme-accent-sepia)]">
            ► SCENARIO TELEMETRY PROFILE:
          </div>
          <p className="leading-relaxed font-semibold text-[var(--theme-text-main)] text-[12px]">
            {currentDef.brief}
          </p>
        </div>

        {/* Target Vector Cluster & Model Info */}
        <div className="bg-[var(--theme-panel-surface)] p-3 border border-[var(--theme-border)] rounded-xs flex flex-col justify-between space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[var(--theme-text-muted)] flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-[var(--theme-accent-pinecone)]" />
              PINECONE INDEX:
            </span>
            <span className="font-bold text-[var(--theme-accent-pinecone)]">
              road-aware-memory
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-[var(--theme-text-muted)] flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-[var(--theme-accent-gemini)]" />
              REASONING MODEL:
            </span>
            <span className="font-bold text-[var(--theme-accent-gemini)]">
              {currentDef.geminiAnalysis.model}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-[var(--theme-text-muted)]">TARGET CLUSTER:</span>
            <span className="text-[var(--theme-text-bright)] font-mono font-bold text-[10px]">
              {currentDef.vectorClusterTarget.targetClusterId}
            </span>
          </div>
        </div>
      </div>

      {/* Collapsible Raw Telemetry Payload Viewer */}
      {showPayload && (
        <div className="mt-3 p-3 bg-[var(--theme-code-bg)] border border-[var(--theme-border-bright)] text-[11px] font-mono animate-fadeIn rounded-xs shadow-xs">
          <div className="flex items-center justify-between text-[10px] border-b border-[var(--theme-border)] pb-1.5 mb-2 text-[var(--theme-text-bright)] font-bold">
            <span>RAW_INGEST_TELEMETRY_PACKET.JSON (INBOUND VEHICLE SENSOR STREAM)</span>
            <span className="text-[var(--theme-primary)] font-bold">[READY_FOR_PIPELINE]</span>
          </div>
          <pre className="text-[var(--theme-text-main)] overflow-x-auto p-1 leading-tight font-semibold">
            {JSON.stringify(currentDef.telemetry, null, 2)}
          </pre>
        </div>
      )}
    </section>
  );
};
