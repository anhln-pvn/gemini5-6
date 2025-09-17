import { safeJson } from './utils.js';

const STATUS_PRIORITY = {
  completed: 3,
  active: 2,
  blocked: 1,
  pending: 0,
};

const COMPLETED_KEYWORDS = ['completed', 'done', 'finished', 'hoan_thanh', 'hoàn thành', 'approved'];
const ACTIVE_KEYWORDS = ['in_progress', 'running', 'processing', 'started', 'đang', 'progress'];
const BLOCKED_KEYWORDS = ['blocked', 'waiting', 'pending', 'đang chờ'];

export function normalizeStatus(raw) {
  if (!raw) return '';
  const text = raw.toString().toLowerCase();
  if (COMPLETED_KEYWORDS.some((kw) => text.includes(kw))) return 'completed';
  if (ACTIVE_KEYWORDS.some((kw) => text.includes(kw))) return 'active';
  if (BLOCKED_KEYWORDS.some((kw) => text.includes(kw))) return 'blocked';
  return '';
}

export function indexWorkflow(workflow) {
  const stepById = new Map();
  const phaseByStep = new Map();
  const agentToSteps = new Map();

  workflow.phases.forEach((phase) => {
    phase.steps.forEach((step) => {
      stepById.set(step.id, step);
      phaseByStep.set(step.id, phase);
      (step.agents || []).forEach((agent) => {
        if (!agentToSteps.has(agent)) {
          agentToSteps.set(agent, []);
        }
        agentToSteps.get(agent).push(step);
      });
    });
  });

  return { stepById, phaseByStep, agentToSteps };
}

export function computeStepStatuses(workflow, state = {}, history = []) {
  const { phaseByStep } = indexWorkflow(workflow);
  const completedSteps = new Set();

  return workflow.phases.flatMap((phase) => {
    return phase.steps.map((step) => {
      const outputs = (step.outputs || []).map((key) => ({
        key,
        value: state?.[key],
        pretty: safeJson(state?.[key]),
        present: state?.[key] !== undefined && state?.[key] !== null,
      }));

      const entries = history.filter((item) => item.step_id === step.id);
      const lastEntry = entries[entries.length - 1];
      const normalized = normalizeStatus(lastEntry?.status);

      let status = 'pending';
      if (outputs.length && outputs.every((o) => o.present)) {
        status = 'completed';
      } else if (normalized) {
        status = normalized;
      }

      if (status === 'pending') {
        if (entries.length) {
          const noteStatus = normalizeStatus(entries[entries.length - 1]?.note);
          if (noteStatus) {
            status = noteStatus;
          }
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
      };
    });
  });
}

export function buildAgentStatuses(stepStatuses) {
  const map = new Map();
  stepStatuses.forEach(({ step, status }) => {
    (step.agents || []).forEach((agentId) => {
      const current = map.get(agentId);
      const priority = STATUS_PRIORITY[status] ?? 0;
      if (!current || (STATUS_PRIORITY[current.status] ?? -1) < priority) {
        map.set(agentId, { status, steps: [] });
      }
      const entry = map.get(agentId);
      entry.steps.push(step.id);
    });
  });
  return map;
}

export function groupStepsByPhase(stepStatuses) {
  const phases = new Map();
  stepStatuses.forEach((entry) => {
    const { phase } = entry;
    if (!phases.has(phase.id)) {
      phases.set(phase.id, { phase, steps: [] });
    }
    phases.get(phase.id).steps.push(entry);
  });
  return Array.from(phases.values());
}

export function stepsForAgent(agentId, stepStatuses) {
  return stepStatuses.filter(({ step }) => (step.agents || []).includes(agentId));
}
