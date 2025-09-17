const listeners = new Set();

const state = {
  baseUrl: 'http://localhost:8000',
  session: null,
  workflowPlan: null,
  workflowState: {},
  workflowHistory: [],
  workflowSummary: null,
  workflowId: null,
  events: [],
  agentStatuses: new Map(),
  stepStatuses: [],
  lastRunAt: null,
  loading: false,
  error: null,
};

export function getState() {
  return state;
}

export function updateState(patch) {
  let dirty = false;
  Object.entries(patch).forEach(([key, value]) => {
    if (state[key] !== value) {
      state[key] = value;
      dirty = true;
    }
  });
  if (dirty) {
    listeners.forEach((listener) => listener(state));
  }
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function resetErrors() {
  updateState({ error: null });
}
