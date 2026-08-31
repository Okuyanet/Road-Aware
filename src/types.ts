export type ScenarioKey = 'A5_LAST_EXIT' | 'AMPLE_DIVERSION' | 'LOW_DIRECTION_CONFIDENCE';

export type TerminalTheme = 'eggshell' | 'palegrey' | 'warmparchment';

export type LogLevel = 'INFO' | 'SYS' | 'TELEMETRY' | 'PINECONE' | 'GEMINI' | 'ROUTING' | 'WARN' | 'SUCCESS';

export interface TelemetryData {
  vehicle_id: string;
  speed_kph: number;
  delta_speed_last_5s: number;
  latitude: number;
  longitude: number;
  heading_degrees: number;
  heading_uncertainty_deg: number;
  gps_hdop: number;
  road_segment_id: string;
  target_junction_id: string;
  distance_to_junction_meters: number;
  lane_position: string;
  headway_distance_meters: number;
  sensor_anomalies_detected: string[];
}

export interface ScenarioDefinition {
  id: ScenarioKey;
  label: string;
  badge: string;
  brief: string;
  telemetry: TelemetryData;
  vectorClusterTarget: {
    index: string;
    namespace: string;
    targetClusterId: string;
    matchedNeighbors: number;
    similarityScore: number;
    precedentSummary: string;
  };
  geminiAnalysis: {
    model: string;
    spatialReasoningSummary: string;
    dangerLevel: 'CRITICAL' | 'MODERATE' | 'LOW';
    safetyRulesTriggered: string[];
    confidence: number;
  };
  decisionResponse: ApiDecisionResponse;
}

export interface LogStep {
  id: string;
  timestamp: string;
  level: LogLevel;
  tag: string;
  message: string;
  details?: Record<string, string | number | boolean | string[]>;
  highlight?: boolean;
}

export interface ApiDecisionResponse {
  status: 200 | 422 | 500;
  decision_id: string;
  scenario: ScenarioKey;
  timestamp: string;
  pipeline_meta: {
    engine: string;
    vector_store: string;
    latency_ms: number;
    tokens_evaluated: number;
    vector_dimension: number;
    memory_cluster: string;
  };
  telemetry_ingest_state: {
    vehicle_id: string;
    road_id: string;
    current_velocity_kph: number;
    spatial_fix_confidence: number;
    shockwave_probability: number;
  };
  vector_memory_retrieval: {
    index: string;
    query_vector_dim: number;
    cosine_similarity: number;
    matched_cluster_id: string;
    historical_cases_count: number;
    cluster_relevance: string;
  };
  gemini_reasoning_evaluation: {
    model_version: string;
    thought_process: string[];
    safety_assertion_passed: boolean;
    spatial_coherence_index: number;
    decision_rationale: string;
  };
  action_plan: {
    directive: 'IMMEDIATE_DIVERT' | 'OPTIMIZE_DIVERSION_ROUTE' | 'SUPPRESS_TURN_RESAMPLE_IMU';
    urgency: 'HIGH' | 'MEDIUM' | 'LOW';
    assigned_diversion_route: string;
    eta_delta_minutes: number;
    driver_hud_instruction: string;
    lane_guidance: string;
    affected_waypoint_ids: string[];
  };
}
