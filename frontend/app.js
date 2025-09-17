import { ACTORS } from './data/actors.js';
import { RELATIONSHIPS } from './data/relationships.js';
import { WORKFLOWS } from './data/workflows.js';
import { createGraph } from './graph.js';
import { renderTimeline } from './timeline.js';
import { computeStepStatuses, buildAgentStatuses, stepsForAgent, indexWorkflow, normalizeStatus } from './workflow.js';
import { subscribe, getState, updateState, resetErrors } from './state.js';
import {
  formatBytes,
  formatDateTime,
  randomId,
  readFileAsArrayBuffer,
  readFileAsText,
  base64Encode,
  compactText,
} from './utils.js';
import {
  setBaseUrl,
  getBaseUrl,
  pingServer,
  createOrUpdateSession,
  getSession,
  runAgent,
} from './api.js';

const elements = {
  backendUrl: document.getElementById('backend-url'),
  connectBtn: document.getElementById('connect-btn'),
  connectionStatus: document.getElementById('connection-status'),
  appName: document.getElementById('app-name'),
  userId: document.getElementById('user-id'),
  sessionId: document.getElementById('session-id'),
  createSessionBtn: document.getElementById('create-session-btn'),
  workflowSelect: document.getElementById('workflow-select'),
  dropzone: document.getElementById('dropzone'),
  fileInput: document.getElementById('file-input'),
  fileInfo: document.getElementById('file-info'),
  fileName: document.getElementById('file-name'),
  fileSize: document.getElementById('file-size'),
  fileEncoding: document.getElementById('file-encoding'),
  userMessage: document.getElementById('user-message'),
  runBtn: document.getElementById('run-workflow-btn'),
  sessionSummary: document.getElementById('session-summary'),
  workflowSummary: document.getElementById('workflow-summary'),
  lastEvent: document.getElementById('last-event'),
  refreshSession: document.getElementById('refresh-session-btn'),
  graph: document.getElementById('graph'),
  actorDetail: document.getElementById('actor-detail'),
  actorName: document.getElementById('actor-name'),
  actorTitle: document.getElementById('actor-title'),
  actorDescription: document.getElementById('actor-description'),
  actorSteps: document.getElementById('actor-steps'),
  timeline: document.getElementById('timeline'),
  expandAll: document.getElementById('expand-all-btn'),
  summaryContent: document.getElementById('summary-content'),
  metricsContent: document.getElementById('metrics-content'),
  eventLog: document.getElementById('event-log'),
};

let selectedWorkflowId = WORKFLOWS[0]?.id ?? null;
let graphController;
let selectedActorId = null;
let currentFile = null;
let currentFilePayload = null;

const animationState = {
  sessionKey: null,
  lastHistoryCount: 0,
  pendingStepHighlights: new Set(),
  pendingAgentPulses: [],
  pendingLogEntries: [],
};

const STATUS_BADGES = {
  completed: { label: 'Hoàn tất', tone: 'completed' },
  active: { label: 'Đang xử lý', tone: 'active' },
  blocked: { label: 'Đang chờ', tone: 'blocked' },
  pending: { label: 'Chờ kích hoạt', tone: 'pending' },
};

function setConnectionStatus(type, message) {
  const statusEl = elements.connectionStatus;
  statusEl.classList.remove('status-idle', 'status-ok', 'status-error');
  if (type === 'ok') {
    statusEl.classList.add('status-ok');
  } else if (type === 'error') {
    statusEl.classList.add('status-error');
  } else {
    statusEl.classList.add('status-idle');
  }
  statusEl.textContent = message;
}

function syncAnimationSession(session) {
  const key = session ? `${session.userId}::${session.id}` : null;
  if (animationState.sessionKey === key) {
    return;
  }
  animationState.sessionKey = key;
  animationState.lastHistoryCount = Array.isArray(session?.state?.['workflow:history'])
    ? session.state['workflow:history'].length
    : 0;
  animationState.pendingAgentPulses.length = 0;
  animationState.pendingLogEntries.length = 0;
  animationState.pendingStepHighlights.clear();
}

function hydrateWorkflowState(session) {
  syncAnimationSession(session);
  if (!session) {
    updateState({
      workflowPlan: null,
      workflowState: {},
      workflowHistory: [],
      workflowSummary: null,
      stepStatuses: [],
      agentStatuses: new Map(),
    });
    return;
  }

  const state = session.state || {};
  const loadedPlan = state['workflow:plan'];
  const history = Array.isArray(state['workflow:history']) ? state['workflow:history'] : [];
  const summary = state['workflow:summary'] || null;
  const workflow = loadedPlan || WORKFLOWS.find((wf) => wf.id === selectedWorkflowId) || null;

  let stepStatuses = [];
  let agentStatuses = new Map();
  if (workflow) {
    stepStatuses = computeStepStatuses(workflow, state, history);
    agentStatuses = buildAgentStatuses(stepStatuses);
  }

  updateState({
    workflowId: workflow?.workflow_id || workflow?.id || selectedWorkflowId,
    workflowPlan: workflow,
    workflowState: state,
    workflowHistory: history,
    workflowSummary: summary,
    stepStatuses,
    agentStatuses,
  });
}

function renderSessionMeta() {
  const { session } = getState();
  if (!session) {
    elements.sessionSummary.textContent = 'Chưa khởi tạo';
    elements.workflowSummary.textContent = 'Chưa chạy';
    elements.lastEvent.textContent = '—';
    return;
  }

  elements.sessionSummary.textContent = `${session.userId} / ${session.id}`;

  const { stepStatuses, workflowSummary, workflowPlan } = getState();
  if (stepStatuses?.length) {
    const completed = stepStatuses.filter((s) => s.status === 'completed').length;
    elements.workflowSummary.textContent = `${workflowPlan?.title || 'Workflow'}: ${completed}/${stepStatuses.length} bước`; 
  } else {
    elements.workflowSummary.textContent = workflowPlan?.title || 'Chưa chạy';
  }

  const events = session.events || [];
  const lastEvent = events[events.length - 1];
  if (lastEvent) {
    const author = lastEvent.author || '—';
    const ts = formatDateTime(lastEvent.timestamp);
    const snippet = compactText(lastEvent.content?.parts?.[0]?.text || lastEvent.content?.parts?.[0]?.functionCall?.name || '...');
    elements.lastEvent.textContent = `${author} • ${ts} • ${snippet}`;
  } else {
    elements.lastEvent.textContent = '—';
  }
}

function renderGraph() {
  const { agentStatuses } = getState();
  if (graphController) {
    graphController.update(agentStatuses || new Map());
    flushAgentPulses();
  }
  if (selectedActorId) {
    renderActorDetail(selectedActorId);
  }
}

function prepareHistoryAnimations() {
  const { workflowHistory, workflowPlan } = getState();
  if (!Array.isArray(workflowHistory)) {
    return;
  }

  if (workflowHistory.length < animationState.lastHistoryCount) {
    animationState.lastHistoryCount = workflowHistory.length;
    animationState.pendingStepHighlights.clear();
    animationState.pendingAgentPulses.length = 0;
    animationState.pendingLogEntries.length = 0;
  }

  if (workflowHistory.length <= animationState.lastHistoryCount) {
    return;
  }

  let stepById = new Map();
  if (workflowPlan) {
    const index = indexWorkflow(workflowPlan);
    stepById = index.stepById;
  }
  const baseIndex = animationState.lastHistoryCount;
  const newEntries = workflowHistory.slice(baseIndex);

  newEntries.forEach((entry, offset) => {
    const step = stepById.get(entry.step_id);
    if (!step) {
      animationState.pendingLogEntries.push(baseIndex + offset);
      return;
    }
    animationState.pendingStepHighlights.add(step.id);
    animationState.pendingLogEntries.push(baseIndex + offset);

    if (Array.isArray(step.agents) && step.agents.length) {
      animationState.pendingAgentPulses.push({
        agents: step.agents,
      });
    }
  });

  animationState.lastHistoryCount = workflowHistory.length;
}

function flushAgentPulses() {
  if (!graphController || !animationState.pendingAgentPulses.length) {
    return;
  }

  while (animationState.pendingAgentPulses.length) {
    const { agents } = animationState.pendingAgentPulses.shift();
    agents.forEach((agentId, idx) => {
      graphController.pulseAgent(agentId, { duration: 1600 + idx * 140 });
    });
  }
}

function applyPendingHighlights() {
  if (!animationState.pendingStepHighlights.size) return;
  animationState.pendingStepHighlights.forEach((stepId) => {
    const el = elements.timeline?.querySelector?.(`[data-step-id="${stepId}"]`);
    if (!el) return;
    el.classList.add('step-highlight');
    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    window.setTimeout(() => {
      el.classList.remove('step-highlight');
    }, 2000);
  });
  animationState.pendingStepHighlights.clear();
}

function highlightLogEntries() {
  if (!animationState.pendingLogEntries.length) return;
  const queue = [...animationState.pendingLogEntries];
  animationState.pendingLogEntries.length = 0;
  queue.forEach((logIndex) => {
    const selector = `[data-log-index="${logIndex}"]`;
    const node = elements.eventLog?.querySelector?.(selector);
    if (!node) return;
    node.classList.add('log-flash');
    window.setTimeout(() => node.classList.remove('log-flash'), 2200);
  });
}

function renderTimelinePanel() {
  const { workflowPlan, stepStatuses } = getState();
  if (!workflowPlan) {
    elements.timeline.innerHTML = '<div class="empty-state">Chưa có workflow nào được tải.</div>';
    return;
  }
  const autoExpand = stepStatuses?.some((step) => step.status === 'active');
  renderTimeline(elements.timeline, workflowPlan, stepStatuses || [], {
    autoExpand,
  });
  applyPendingHighlights();
}

function renderSummaryCard() {
  const { workflowSummary, workflowPlan } = getState();
  if (!workflowSummary) {
    elements.summaryContent.innerHTML = '<p>Chưa có báo cáo tổng kết từ workflow.</p>';
  } else {
    const { summary, next_actions: nextActions, metrics } = workflowSummary;
    const html = `
      <h3>Kết quả cuối cùng</h3>
      <p>${summary || '—'}</p>
      ${nextActions ? `<h4>Hành động tiếp theo</h4><p>${nextActions}</p>` : ''}
      <p class="hint">Hoàn tất lúc ${formatDateTime(workflowSummary.finalized_at)} bởi ${workflowSummary.finalized_by || '—'}</p>
    `;
    elements.summaryContent.innerHTML = html;

    const metricsEl = elements.metricsContent;
    metricsEl.innerHTML = '';
    if (metrics && Object.keys(metrics).length) {
      Object.entries(metrics).forEach(([name, value]) => {
        const div = document.createElement('div');
        div.className = 'metric-item';
        div.innerHTML = `<strong>${name}</strong><span>${typeof value === 'number' ? value.toFixed(2) : value}</span>`;
        metricsEl.appendChild(div);
      });
    } else if (workflowPlan?.metrics?.length) {
      workflowPlan.metrics.forEach((metric) => {
        const div = document.createElement('div');
        div.className = 'metric-item';
        div.innerHTML = `<strong>${metric.name}</strong><span>${metric.description}</span>`;
        metricsEl.appendChild(div);
      });
    }
  }
}

function renderHistoryCard() {
  const { workflowHistory, workflowPlan } = getState();
  const container = elements.eventLog;

  if (!Array.isArray(workflowHistory) || !workflowHistory.length) {
    container.innerHTML = '<div class="empty-state">Chưa có lịch sử workflow.</div>';
    return;
  }

  const stickToBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 32;

  let stepById = new Map();
  let phaseByStep = new Map();
  if (workflowPlan) {
    const index = indexWorkflow(workflowPlan);
    stepById = index.stepById;
    phaseByStep = index.phaseByStep;
  }

  container.innerHTML = '';
  const fragment = document.createDocumentFragment();

  const total = workflowHistory.length;
  const startIndex = Math.max(0, total - 80);

  for (let idx = startIndex; idx < total; idx += 1) {
    const entry = workflowHistory[idx];
    const statusKey = normalizeStatus(entry.status) || normalizeStatus(entry.note) || 'pending';
    const badge = STATUS_BADGES[statusKey] ?? STATUS_BADGES.pending;
    const block = document.createElement('div');
    block.className = `log-entry tone-${badge.tone}`;
    block.dataset.logIndex = String(idx);

    const step = stepById.get(entry.step_id);
    const phase = phaseByStep.get(entry.step_id);
    if (step) {
      block.dataset.stepId = step.id;
    }

    const topLine = document.createElement('div');
    topLine.className = 'log-headline';

    const badgeEl = document.createElement('span');
    badgeEl.className = `status-badge tone-${badge.tone}`;
    badgeEl.textContent = badge.label;
    topLine.appendChild(badgeEl);

    const stepLabel = document.createElement('span');
    stepLabel.className = 'step-label';
    const phaseText = phase?.name ? `${phase.name} • ` : '';
    stepLabel.textContent = `${phaseText}${step?.name || entry.step_id}`;
    topLine.appendChild(stepLabel);

    const metadata = document.createElement('div');
    metadata.className = 'meta';
    metadata.textContent = `${formatDateTime(entry.timestamp)} • ${entry.actor || '—'}`;

    const message = document.createElement('p');
    message.className = 'message';
    message.textContent = entry.note || entry.status || 'Cập nhật';
    if (entry.note) {
      message.title = entry.note;
    }

    block.appendChild(topLine);
    block.appendChild(metadata);
    block.appendChild(message);

    fragment.appendChild(block);
  }

  container.appendChild(fragment);

  if (stickToBottom) {
    container.scrollTop = container.scrollHeight;
  }
}

function renderActorDetail(actorId) {
  const actor = ACTORS.find((item) => item.id === actorId);
  const { stepStatuses } = getState();
  if (!actor) {
    elements.actorDetail.hidden = true;
    return;
  }
  elements.actorDetail.hidden = false;
  elements.actorName.textContent = actor.name;
  elements.actorTitle.textContent = actor.title;
  elements.actorDescription.textContent = actor.description;
  const ul = elements.actorSteps;
  ul.innerHTML = '';
  const steps = stepsForAgent(actorId, stepStatuses || []);
  if (!steps.length) {
    const li = document.createElement('li');
    li.textContent = 'Chưa có bước nào của workflow.';
    ul.appendChild(li);
    return;
  }
  steps.forEach((entry) => {
    const li = document.createElement('li');
    li.textContent = `${entry.step.name} • ${entry.status === 'completed' ? 'Hoàn tất' : entry.status === 'active' ? 'Đang xử lý' : entry.status === 'blocked' ? 'Đang chờ' : 'Chưa bắt đầu'}`;
    ul.appendChild(li);
  });
}

function renderWorkflowOptions() {
  elements.workflowSelect.innerHTML = '';
  WORKFLOWS.forEach((workflow) => {
    const option = document.createElement('option');
    option.value = workflow.id;
    option.textContent = workflow.title;
    elements.workflowSelect.appendChild(option);
  });
  if (selectedWorkflowId) {
    elements.workflowSelect.value = selectedWorkflowId;
  }
}

function renderAll() {
  prepareHistoryAnimations();
  renderSessionMeta();
  renderGraph();
  renderTimelinePanel();
  renderSummaryCard();
  renderHistoryCard();
  highlightLogEntries();
}

function updateRunButtonState() {
  const { session } = getState();
  const hasFile = Boolean(currentFilePayload);
  elements.runBtn.disabled = !(session && hasFile);
}

async function handleConnect() {
  const url = elements.backendUrl.value.trim() || 'http://localhost:8000';
  setBaseUrl(url);
  try {
    setConnectionStatus('idle', 'Đang kiểm tra...');
    const apps = await pingServer();
    if (Array.isArray(apps)) {
      setConnectionStatus('ok', `Sẵn sàng • ${apps.length} agent`);
    } else {
      setConnectionStatus('ok', 'Sẵn sàng');
    }
  } catch (error) {
    console.error(error);
    setConnectionStatus('error', 'Không kết nối được API');
  }
}

async function handleCreateSession() {
  const appName = elements.appName.value.trim();
  let userId = elements.userId.value.trim();
  let sessionId = elements.sessionId.value.trim();

  if (!userId) {
    userId = randomId('user');
    elements.userId.value = userId;
  }
  if (!sessionId) {
    sessionId = randomId('session');
    elements.sessionId.value = sessionId;
  }

  try {
    setConnectionStatus('idle', 'Đang tạo session...');
    const session = await createOrUpdateSession({
      appName,
      userId,
      sessionId,
      state: {
        'ui:workflow_selected': selectedWorkflowId,
        'ui:last_update': new Date().toISOString(),
      },
    });
    hydrateWorkflowState(session);
    renderAll();
    setConnectionStatus('ok', 'Session sẵn sàng');
    updateRunButtonState();
  } catch (error) {
    console.error(error);
    setConnectionStatus('error', error.message);
  }
}

function extractMessageParts(textSummary, filePayload) {
  const parts = [];
  if (textSummary) {
    parts.push({ text: textSummary });
  }
  if (filePayload) {
    parts.push({
      inlineData: {
        displayName: filePayload.name,
        data: filePayload.base64,
        mimeType: filePayload.mimeType,
      },
    });
  }
  return parts;
}

async function handleRunWorkflow() {
  const { session } = getState();
  if (!session) return;
  const appName = elements.appName.value.trim();
  const userId = session.userId;
  const sessionId = session.id;

  try {
    resetErrors();
    elements.runBtn.disabled = true;
    setConnectionStatus('idle', 'Đang chạy workflow...');

    const workflow = WORKFLOWS.find((wf) => wf.id === selectedWorkflowId);
    const userNotes = elements.userMessage.value.trim();

    const summaryText = `Kích hoạt workflow ${workflow?.title || selectedWorkflowId}. ${userNotes || ''}`.trim();

    const parts = extractMessageParts(summaryText, currentFilePayload);

    await runAgent({
      appName,
      userId,
      sessionId,
      message: {
        role: 'user',
        parts,
      },
      streaming: false,
    });

    const refreshed = await getSession({ appName, userId, sessionId });
    hydrateWorkflowState(refreshed);
    renderAll();
    setConnectionStatus('ok', 'Workflow đã chạy');
  } catch (error) {
    console.error(error);
    setConnectionStatus('error', error.message);
  } finally {
    elements.runBtn.disabled = false;
  }
}

async function handleRefreshSession() {
  const { session } = getState();
  if (!session) return;
  try {
    setConnectionStatus('idle', 'Đang đồng bộ...');
    const appName = elements.appName.value.trim();
    const refreshed = await getSession({
      appName,
      userId: session.userId,
      sessionId: session.id,
    });
    hydrateWorkflowState(refreshed);
    renderAll();
    setConnectionStatus('ok', 'Đã cập nhật');
  } catch (error) {
    console.error(error);
    setConnectionStatus('error', error.message);
  }
}

async function ingestFile(file) {
  if (!file) return;
  try {
    currentFile = file;
    const buffer = await readFileAsArrayBuffer(file);
    const base64 = base64Encode(buffer);
    let textContent = '';
    try {
      textContent = await readFileAsText(file);
    } catch (err) {
      textContent = '';
    }
    currentFilePayload = {
      name: file.name,
      size: file.size,
      mimeType: file.type || 'application/octet-stream',
      base64,
      textPreview: compactText(textContent, 400),
    };
    elements.fileName.textContent = file.name;
    elements.fileSize.textContent = formatBytes(file.size);
    elements.fileEncoding.textContent = file.type || 'Không xác định';
    elements.fileInfo.hidden = false;
    updateRunButtonState();
  } catch (error) {
    console.error(error);
    setConnectionStatus('error', 'Không đọc được tệp tải lên');
  }
}

function setupDropzone() {
  const { dropzone, fileInput } = elements;
  const openPicker = () => fileInput.click();
  dropzone.addEventListener('click', openPicker);
  dropzone.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openPicker();
    }
  });

  dropzone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropzone.classList.add('dragover');
  });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
  dropzone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropzone.classList.remove('dragover');
    const file = event.dataTransfer.files?.[0];
    if (file) {
      ingestFile(file);
    }
  });

  fileInput.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (file) {
      ingestFile(file);
    }
  });
}

function setupSubscriptions() {
  subscribe(() => {
    renderAll();
  });
}

function initGraph() {
  graphController = createGraph(elements.graph, ACTORS, RELATIONSHIPS, {
    onSelect: (actorId) => {
      selectedActorId = actorId;
      renderActorDetail(actorId);
    },
  });
  renderGraph();
}

function bootstrap() {
  // Pre-fill inputs
  elements.userId.value = randomId('user');
  elements.sessionId.value = randomId('session');
  elements.backendUrl.value = getBaseUrl();

  renderWorkflowOptions();
  initGraph();
  setupDropzone();
  setupSubscriptions();
  renderAll();

  elements.connectBtn.addEventListener('click', handleConnect);
  elements.createSessionBtn.addEventListener('click', handleCreateSession);
  elements.runBtn.addEventListener('click', handleRunWorkflow);
  elements.refreshSession.addEventListener('click', handleRefreshSession);
  elements.workflowSelect.addEventListener('change', (event) => {
    selectedWorkflowId = event.target.value;
    const { session } = getState();
    if (session) {
      hydrateWorkflowState(session);
      renderAll();
    }
  });
  elements.expandAll.addEventListener('click', () => {
    elements.timeline.querySelectorAll('.phase').forEach((phase) => {
      phase.classList.remove('collapsed');
      const btn = phase.querySelector('.collapse-btn');
      if (btn) btn.classList.remove('collapsed');
    });
  });

  window.addEventListener('load', () => {
    setConnectionStatus('idle', 'Chưa kết nối');
  });
}

bootstrap();
