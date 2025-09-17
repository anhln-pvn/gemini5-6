export interface WorkflowHistoryEntry {
  timestamp: string;
  actor?: string;
  step_id: string;
  status?: string;
  note?: string;
}

export interface WorkflowSummaryPayload {
  summary?: string;
  next_actions?: string;
  metrics?: Record<string, unknown>;
  finalized_at?: string;
  finalized_by?: string;
}

export interface WorkflowState {
  [key: string]: unknown;
}

export interface SessionEventPart {
  text?: string;
  functionCall?: {
    name: string;
    args?: unknown;
  };
}

export interface SessionEvent {
  id?: string;
  author?: string;
  timestamp?: string | number;
  content?: {
    parts?: SessionEventPart[];
  };
}

export interface SessionRecord {
  id: string;
  userId: string;
  appName?: string;
  createdAt?: string;
  updatedAt?: string;
  state: WorkflowState;
  events?: SessionEvent[];
}

export interface RunAgentParams {
  appName: string;
  userId: string;
  sessionId: string;
  message: {
    role: 'user' | 'system' | 'assistant';
    parts: unknown[];
  };
  streaming?: boolean;
}
