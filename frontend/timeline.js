import { groupStepsByPhase } from './workflow.js';
import { formatDateTime } from './utils.js';

const STATUS_LABEL = {
  pending: 'Chờ kích hoạt',
  blocked: 'Đang chờ bước trước',
  active: 'Đang xử lý',
  completed: 'Hoàn tất',
};

function renderInstructions(container, instructions = []) {
  if (!instructions?.length) return;
  const list = document.createElement('ul');
  list.className = 'instruction-list';
  instructions.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    list.appendChild(li);
  });
  container.appendChild(list);
}

function renderOutputs(container, outputs = []) {
  const present = outputs.filter((out) => out.present);
  if (!present.length) return;
  present.forEach(({ key, pretty }) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'output-block';
    const label = document.createElement('strong');
    label.textContent = key;
    const pre = document.createElement('pre');
    pre.textContent = pretty;
    wrapper.appendChild(label);
    wrapper.appendChild(pre);
    container.appendChild(wrapper);
  });
}

function renderHistory(container, history = []) {
  if (!history.length) return;
  const last = history[history.length - 1];
  const div = document.createElement('div');
  div.className = 'history-note';
  const title = document.createElement('strong');
  title.textContent = `Cập nhật ${formatDateTime(last.timestamp)}:`;
  const note = document.createElement('p');
  note.textContent = last.note || last.status || '—';
  div.appendChild(title);
  div.appendChild(note);
  container.appendChild(div);
}

export function renderTimeline(container, workflow, stepStatuses, { expandedPhases = new Set(), autoExpand = false } = {}) {
  container.innerHTML = '';
  const templatePhase = document.getElementById('timeline-phase-template');
  const templateStep = document.getElementById('timeline-step-template');

  const grouped = groupStepsByPhase(stepStatuses);
  grouped.forEach(({ phase, steps }) => {
    const phaseNode = templatePhase.content.firstElementChild.cloneNode(true);
    const header = phaseNode.querySelector('.phase-header');
    const collapseBtn = header.querySelector('.collapse-btn');
    const title = header.querySelector('.phase-title');
    const summary = header.querySelector('.phase-summary');
    const stepList = phaseNode.querySelector('.step-list');

    title.textContent = `${phase.name}`;
    summary.textContent = phase.summary;

    const shouldExpand = autoExpand || expandedPhases.has(phase.id);

    collapseBtn.addEventListener('click', () => {
      phaseNode.classList.toggle('collapsed');
      collapseBtn.classList.toggle('collapsed');
    });

    if (!shouldExpand) {
      phaseNode.classList.add('collapsed');
      collapseBtn.classList.add('collapsed');
    }

    steps.forEach((entry) => {
      const { step, status, outputs, history } = entry;
      const stepNode = templateStep.content.firstElementChild.cloneNode(true);
      stepNode.dataset.stepId = step.id;
      stepNode.dataset.stepStatus = status;
      const statusEl = stepNode.querySelector('.step-status');
      const titleEl = stepNode.querySelector('.step-title');
      const metaEl = stepNode.querySelector('.step-meta');
      const bodyEl = stepNode.querySelector('.step-body');

      statusEl.textContent = STATUS_LABEL[status] ?? 'Chờ xử lý';
      statusEl.classList.add(status);

      titleEl.textContent = step.name;

      const agents = (step.agents || []).join(', ');
      const role = step.role || '—';
      const deadline = step.deadline || '';
      metaEl.textContent = `Vai trò: ${role} • Ban: ${agents || '—'}${deadline ? ` • Hạn: ${deadline}` : ''}`;

      renderInstructions(bodyEl, step.instructions);
      renderOutputs(bodyEl, outputs);
      renderHistory(bodyEl, history);

      if (!bodyEl.children.length) {
        const empty = document.createElement('p');
        empty.className = 'hint';
        empty.textContent = 'Chưa có dữ liệu đầu ra.';
        bodyEl.appendChild(empty);
      }

      stepList.appendChild(stepNode);
    });

    container.appendChild(phaseNode);
  });
}
