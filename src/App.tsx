/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ScenarioKey, TerminalTheme, LogStep, ApiDecisionResponse } from './types';
import { SCENARIO_DEFINITIONS, generatePipelineLogs } from './data/scenarios';
import { AsciiLogo } from './components/AsciiLogo';
import { ScenarioSelector } from './components/ScenarioSelector';
import { ActionButton } from './components/ActionButton';
import { AgentPipelineLog } from './components/AgentPipelineLog';
import { ApiOutputConsole } from './components/ApiOutputConsole';
import { InteractiveCliPrompt } from './components/InteractiveCliPrompt';
import { Footer } from './components/Footer';
import { terminalAudio } from './utils/audio';

export default function App() {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioKey>('A5_LAST_EXIT');
  const [theme, setTheme] = useState<TerminalTheme>('eggshell');
  const [crtEnabled, setCrtEnabled] = useState<boolean>(true);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [streamSpeed, setStreamSpeed] = useState<'realtime' | 'fast' | 'instant'>('fast');

  const [logs, setLogs] = useState<LogStep[]>([]);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [decision, setDecision] = useState<ApiDecisionResponse | null>(null);

  const streamTimerRef = useRef<NodeJS.Timeout[]>([]);

  // Apply data-theme attribute on root element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      streamTimerRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  const handleClear = useCallback(() => {
    streamTimerRef.current.forEach((t) => clearTimeout(t));
    streamTimerRef.current = [];
    setLogs([]);
    setDecision(null);
    setIsExecuting(false);
  }, []);

  const handleExecute = useCallback(
    async (targetScenario?: ScenarioKey) => {
      const scenarioKey = targetScenario || selectedScenario;
      handleClear();
      setIsExecuting(true);

      const allLogs = generatePipelineLogs(scenarioKey);
      const scenarioDef = SCENARIO_DEFINITIONS[scenarioKey];

      // Fetch live data from Google Cloud deployment via backend proxy
      let cloudResponse: any = null;
      try {
        const res = await fetch('/api/traffic/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scenario: scenarioKey,
            telemetry: scenarioDef.telemetry,
          }),
        });
        if (res.ok) {
          cloudResponse = await res.json();
        }
      } catch (err) {
        console.warn('Failed to reach live cloud API, falling back to scenario decision definition:', err);
      }

      // Construct final decision combining cloud response and scenario definition
      let finalDecision: ApiDecisionResponse = scenarioDef.decisionResponse;
      if (cloudResponse && cloudResponse.status === 'success') {
        finalDecision = {
          ...scenarioDef.decisionResponse,
          decision_id: cloudResponse.traffic_event?.event_id || scenarioDef.decisionResponse.decision_id,
          scenario: scenarioKey,
          timestamp: new Date().toISOString(),
          pipeline_meta: {
            ...scenarioDef.decisionResponse.pipeline_meta,
            engine: 'Gemini-3.5-Flash + Pinecone Serverless (Google Cloud Deployed)',
            vector_store: 'pinecone://road-aware-memory/ns/google-cloud-prod',
          },
          vector_memory_retrieval: {
            ...scenarioDef.decisionResponse.vector_memory_retrieval,
            cosine_similarity: cloudResponse.memory_context?.top_similarity_score || scenarioDef.decisionResponse.vector_memory_retrieval.cosine_similarity,
            historical_cases_count: cloudResponse.memory_context?.matched_historical_patterns || scenarioDef.decisionResponse.vector_memory_retrieval.historical_cases_count,
            cluster_relevance: cloudResponse.memory_context?.recommendation_precedent || scenarioDef.decisionResponse.vector_memory_retrieval.cluster_relevance,
          },
          gemini_reasoning_evaluation: {
            ...scenarioDef.decisionResponse.gemini_reasoning_evaluation,
            thought_process: cloudResponse.agent_decision?.reasons || scenarioDef.decisionResponse.gemini_reasoning_evaluation.thought_process,
            spatial_coherence_index: cloudResponse.agent_decision?.confidence || scenarioDef.decisionResponse.gemini_reasoning_evaluation.spatial_coherence_index,
            decision_rationale: cloudResponse.agent_decision?.advisory_message || scenarioDef.decisionResponse.gemini_reasoning_evaluation.decision_rationale,
          },
          action_plan: {
            ...scenarioDef.decisionResponse.action_plan,
            driver_hud_instruction: cloudResponse.agent_decision?.advisory_message || scenarioDef.decisionResponse.action_plan.driver_hud_instruction,
            eta_delta_minutes: cloudResponse.route_context?.estimated_delay_minutes ? -cloudResponse.route_context.estimated_delay_minutes : scenarioDef.decisionResponse.action_plan.eta_delta_minutes,
          },
        };
      }

      if (streamSpeed === 'instant') {
        // Render all logs and live decision immediately
        setLogs(allLogs);
        setDecision(finalDecision);
        setIsExecuting(false);
        terminalAudio.playSuccessChime();
        return;
      }

      // Streaming delay calculation
      const stepDelay = streamSpeed === 'realtime' ? 120 : 45;

      allLogs.forEach((step, idx) => {
        const timer = setTimeout(() => {
          setLogs((prev) => [...prev, step]);
          terminalAudio.playStepPip(step.level);

          // Once last log step finishes, output live JSON decision
          if (idx === allLogs.length - 1) {
            const finalTimer = setTimeout(() => {
              setDecision(finalDecision);
              setIsExecuting(false);
              terminalAudio.playSuccessChime();
            }, stepDelay * 1.5);
            streamTimerRef.current.push(finalTimer);
          }
        }, idx * stepDelay);

        streamTimerRef.current.push(timer);
      });
    },
    [selectedScenario, streamSpeed, handleClear]
  );

  const handleSelectScenario = (key: ScenarioKey) => {
    setSelectedScenario(key);
    // If output is already shown, auto-preview or clear
    if (decision) {
      handleClear();
    }
  };

  // Keyboard shortcut: Ctrl+Enter or Cmd+Enter to execute
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isExecuting) {
          handleExecute();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleExecute, isExecuting]);

  return (
    <div className="relative min-h-screen flex flex-col justify-between p-3 sm:p-5 md:p-8 max-w-7xl mx-auto selection:bg-[var(--theme-primary)] selection:text-black">
      {/* CRT Scanline Filter Overlay */}
      {crtEnabled && (
        <div className="crt-scanlines fixed inset-0 pointer-events-none z-50 opacity-70"></div>
      )}

      {/* Main Terminal Shell Box */}
      <div className="flex-1 flex flex-col">
        {/* Header: Simple ASCII Art Logo for ROAD AWARE API */}
        <AsciiLogo
          theme={theme}
          setTheme={setTheme}
          crtEnabled={crtEnabled}
          setCrtEnabled={setCrtEnabled}
          audioEnabled={audioEnabled}
          setAudioEnabled={setAudioEnabled}
        />

        {/* Clean Subdued Onboarding Subtitle */}
        <div className="mb-3 px-1 text-center font-mono text-xs sm:text-sm text-[var(--theme-text-muted)] tracking-wide">
          Simulate real-time vehicle sensor feeds to see how the autonomous Gemini agent evaluates traffic shockwaves and decides exactly when to intervene.
        </div>

        {/* Scenario Selector Dropdown */}
        <ScenarioSelector
          selectedScenario={selectedScenario}
          onSelectScenario={handleSelectScenario}
          disabled={isExecuting}
        />

        {/* Action Command Button: > EXECUTE /traffic/analyze */}
        <ActionButton
          isExecuting={isExecuting}
          onExecute={() => handleExecute()}
          onReset={handleClear}
          hasOutput={logs.length > 0 || decision !== null}
          streamSpeed={streamSpeed}
          setStreamSpeed={setStreamSpeed}
        />

        {/* Side-by-Side Terminals Workspace */}
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 mb-4">
          <section className="flex flex-col min-h-[420px]">
            <AgentPipelineLog
              logs={logs}
              isStreaming={isExecuting}
              activeScenarioName={selectedScenario}
            />
          </section>
          <section className="flex flex-col min-h-[420px]">
            <ApiOutputConsole
              decision={decision}
              isExecuting={isExecuting}
            />
          </section>
        </main>

        {/* Interactive CLI Terminal Prompt */}
        <InteractiveCliPrompt
          onExecuteScenario={(key) => handleExecute(key)}
          onSelectScenario={handleSelectScenario}
          onClear={handleClear}
          onSetTheme={setTheme}
          onToggleCrt={(val) => setCrtEnabled(val ?? !crtEnabled)}
          onToggleAudio={(val) => {
            const next = val ?? !audioEnabled;
            setAudioEnabled(next);
            terminalAudio.setEnabled(next);
          }}
          currentScenario={selectedScenario}
        />
      </div>

      {/* Footer: © 2026 Road Aware Intelligence | Powered by Gemini & Pinecone Vector State */}
      <Footer />
    </div>
  );
}
