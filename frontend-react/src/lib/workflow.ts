import type { Workflow, WorkflowPhase, WorkflowStep } from '../data/workflows';
import type { WorkflowHistoryEntry, WorkflowSummaryPayload, WorkflowState } from '../api/types';

export type StepStatus = 'pending' | 'blocked' | 'active' | 'completed';

export interface StepStatusEntry {
  phase: WorkflowPhase;
  step: WorkflowStep;
  outputs: Array<{
    key: string;
    value: unknown;
    present: boolean;
    pretty: string;
  }>;
  history: WorkflowHistoryEntry[];
  lastEntry?: WorkflowHistoryEntry;
  status: StepStatus;
}

export interface AgentStatusEntry {
  status: StepStatus;
  steps: string[];
}

export interface WorkflowIndex {
  stepById: Map<string, WorkflowStep>;
  phaseByStep: Map<string, WorkflowPhase>;
  agentToSteps: Map<string, WorkflowStep[]>;
}

const STATUS_PRIORITY: Record<StepStatus, number> = {
  completed: 3,
  active: 2,
  blocked: 1,
  pending: 0,
};

const COMPLETED_KEYWORDS = ['completed', 'done', 'finished', 'hoan_thanh', 'hoàn thành', 'approved'];
const ACTIVE_KEYWORDS = ['in_progress', 'running', 'processing', 'started', 'đang', 'progress'];
const BLOCKED_KEYWORDS = ['blocked', 'waiting', 'pending', 'đang chờ'];

export function normalizeStatus(raw?: string | null) {
  if (!raw) return '';
  const text = raw.toString().toLowerCase();
  if (COMPLETED_KEYWORDS.some((kw) => text.includes(kw))) return 'completed';
  if (ACTIVE_KEYWORDS.some((kw) => text.includes(kw))) return 'active';
  if (BLOCKED_KEYWORDS.some((kw) => text.includes(kw))) return 'blocked';
  return '';
}

export function safeJson(value: unknown) {
  if (value == null) return '';
  try {
    return JSON.stringify(value, null, 2);
  } catch (error) {
    return String(value);
  }
}

export function indexWorkflow(workflow: Workflow): WorkflowIndex {
  const stepById = new Map<string, WorkflowStep>();
  const phaseByStep = new Map<string, WorkflowPhase>();
  const agentToSteps = new Map<string, WorkflowStep[]>();

  workflow.phases.forEach((phase) => {
    phase.steps.forEach((step) => {
      stepById.set(step.id, step);
      phaseByStep.set(step.id, phase);
      step.agents.forEach((agent) => {
        if (!agentToSteps.has(agent)) {
          agentToSteps.set(agent, []);
        }
        agentToSteps.get(agent)!.push(step);
      });
    });
  });

  return { stepById, phaseByStep, agentToSteps };
}

export function computeStepStatuses(
  workflow: Workflow,
  state: WorkflowState = {},
  history: WorkflowHistoryEntry[] = [],
): StepStatusEntry[] {
  const completedSteps = new Set<string>();

  return workflow.phases.flatMap((phase) =>
    phase.steps.map((step) => {
      const outputs = (step.outputs || []).map((key) => ({
        key,
        value: state?.[key],
        present: state?.[key] !== undefined && state?.[key] !== null,
        pretty: safeJson(state?.[key]),
      }));

      const entries = history.filter((item) => item.step_id === step.id);
      const lastEntry = entries[entries.length - 1];
      const normalized = normalizeStatus(lastEntry?.status) as StepStatus | '';

      let status: StepStatus = 'pending';
      if (outputs.length && outputs.every((o) => o.present)) {
        status = 'completed';
      } else if (normalized) {
        status = normalized;
      }

      if (status === 'pending' && entries.length) {
        const noteStatus = normalizeStatus(entries[entries.length - 1]?.note) as StepStatus | '';
        if (noteStatus) {
          status = noteStatus;
        }
      }

      if (status === 'pending') {
        const deps = step.dependencies || [];
        if (deps.length && deps.some((dep) => !completedSteps.has(dep))) {
          status = 'blocked';
        }
      }

      if (status === 'completed') {
        completedSteps.add(step.id);
      }

      return {
        phase,
        step,
        outputs,
        history: entries,
        lastEntry,
        status,
      } satisfies StepStatusEntry;
    }),
  );
}

export function buildAgentStatuses(stepStatuses: StepStatusEntry[]) {
  const map = new Map<string, AgentStatusEntry>();
  stepStatuses.forEach(({ step, status }) => {
    step.agents.forEach((agentId) => {
      const current = map.get(agentId);
      const priority = STATUS_PRIORITY[status];
      if (!current || STATUS_PRIORITY[current.status] < priority) {
        map.set(agentId, { status, steps: [] });
      }
      map.get(agentId)!.steps.push(step.id);
    });
  });
  return map;
}

export function groupStepsByPhase(stepStatuses: StepStatusEntry[]) {
  const phases = new Map<string, { phase: WorkflowPhase; steps: StepStatusEntry[] }>();
  stepStatuses.forEach((entry) => {
    const { phase } = entry;
    if (!phases.has(phase.id)) {
      phases.set(phase.id, { phase, steps: [] });
    }
    phases.get(phase.id)!.steps.push(entry);
  });
  return Array.from(phases.values());
}

export function stepsForAgent(agentId: string, stepStatuses: StepStatusEntry[]) {
  return stepStatuses.filter((entry) => entry.step.agents.includes(agentId));
}

export interface WorkflowSnapshot {
  state: WorkflowState;
  history: WorkflowHistoryEntry[];
  summary?: WorkflowSummaryPayload | null;
}

export function summarizeWorkflow(snapshot: WorkflowSnapshot) {
  const { history, summary } = snapshot;
  return {
    latestNote: history[history.length - 1]?.note ?? '',
    finalized: summary?.finalized_at ?? null,
  };
}
