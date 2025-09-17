import { sortBy } from './utils.js';

const CATEGORY_ORDER = ['board', 'executive', 'division'];
const CATEGORY_Y = {
  board: 120,
  executive: 320,
  division: 560,
};

const CATEGORY_RADIUS = {
  board: 44,
  executive: 42,
  division: 40,
};

const CATEGORY_COLOR = {
  board: 'var(--board)',
  executive: 'var(--executive)',
  division: 'var(--division)',
};

const STATUS_COLOR = {
  pending: 'var(--pending)',
  active: 'var(--warning)',
  completed: 'var(--completed)',
  blocked: 'var(--border)',
};

function shortenLabel(name, id) {
  if (!name) {
    return (id || '').replace(/_/g, ' ').toUpperCase().slice(0, 12);
  }
  if (name.length <= 22) {
    return name;
  }
  const tokens = name
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
  const acronym = tokens
    .map((token) => token[0])
    .join('')
    .toUpperCase();
  if (acronym.length >= 3) {
    return acronym.slice(0, 6);
  }
  return (id || '').replace(/_/g, ' ').toUpperCase().slice(0, 12);
}

function initialsFromName(name) {
  if (!name) return '';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
}

function computeLayout(actors, { baseWidth = 1200, margin = 120, spacing = 120 } = {}) {
  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    nodes: sortBy(
      actors.filter((actor) => actor.category === category),
      (actor) => actor.name
    ),
  }));

  const maxCount = Math.max(1, ...grouped.map(({ nodes }) => nodes.length));
  const width = Math.max(baseWidth, margin * 2 + spacing * Math.max(0, maxCount - 1));
  const positions = new Map();

  grouped.forEach(({ category, nodes }) => {
    const count = nodes.length;
    const y = CATEGORY_Y[category] ?? 0;
    const usableWidth = width - margin * 2;
    nodes.forEach((actor, index) => {
      const step = count > 1 ? usableWidth / (count - 1) : 0;
      const x = count === 1 ? width / 2 : margin + step * index;
      positions.set(actor.id, {
        x,
        y,
        radius: CATEGORY_RADIUS[category] ?? 40,
        color: CATEGORY_COLOR[category] ?? 'var(--accent)',
      });
    });
  });

  return { positions, width };
}

function ensureDefs(svg) {
  let defs = svg.querySelector('defs');
  if (!defs) {
    defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svg.appendChild(defs);
  }
  let marker = defs.querySelector('#arrowhead');
  if (!marker) {
    marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('viewBox', '0 0 10 10');
    marker.setAttribute('refX', '10');
    marker.setAttribute('refY', '5');
    marker.setAttribute('markerWidth', '6');
    marker.setAttribute('markerHeight', '6');
    marker.setAttribute('orient', 'auto-start-reverse');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
    path.setAttribute('fill', 'rgba(47, 125, 52, 0.45)');
    marker.appendChild(path);
    defs.appendChild(marker);
  }
}

export function createGraph(svg, actors, relationships, { onSelect } = {}) {
  const { positions, width } = computeLayout(actors);
  ensureDefs(svg);

  svg.setAttribute('viewBox', `0 0 ${width} 720`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  const edgesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  edgesGroup.setAttribute('class', 'edges');
  const nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  nodesGroup.setAttribute('class', 'nodes');

  svg.appendChild(edgesGroup);
  svg.appendChild(nodesGroup);

  const nodesById = new Map();
  const edges = [];
  const statusByActor = new Map();

  relationships.forEach((rel) => {
    const sourcePos = positions.get(rel.source);
    const targetPos = positions.get(rel.target);
    if (!sourcePos || !targetPos) return;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', sourcePos.x.toFixed(1));
    line.setAttribute('y1', sourcePos.y.toFixed(1));
    line.setAttribute('x2', targetPos.x.toFixed(1));
    line.setAttribute('y2', targetPos.y.toFixed(1));
    line.setAttribute('class', `edge edge-${rel.type}`);
    line.setAttribute('marker-end', 'url(#arrowhead)');
    edgesGroup.appendChild(line);
    edges.push({ element: line, rel });
  });

  actors.forEach((actor) => {
    const pos = positions.get(actor.id);
    if (!pos) return;

    const node = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    node.setAttribute('class', `node node-${actor.category}`);
    node.dataset.actorId = actor.id;

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', pos.x.toFixed(1));
    circle.setAttribute('cy', pos.y.toFixed(1));
    circle.setAttribute('r', pos.radius);
    circle.setAttribute('fill', 'var(--surface)');
    circle.setAttribute('stroke', pos.color);
    circle.setAttribute('stroke-width', '3');

    const label = shortenLabel(actor.name, actor.id);
    const initials = initialsFromName(actor.name) || label.slice(0, 3).toUpperCase();

    const badge = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    badge.setAttribute('x', pos.x.toFixed(1));
    badge.setAttribute('y', pos.y.toFixed(1));
    badge.setAttribute('text-anchor', 'middle');
    badge.setAttribute('dominant-baseline', 'middle');
    badge.setAttribute('fill', 'var(--text)');
    badge.setAttribute('font-weight', '600');
    badge.setAttribute('font-size', '12px');
    badge.textContent = initials;

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', pos.x.toFixed(1));
    text.setAttribute('y', (pos.y + pos.radius + 18).toFixed(1));
    text.setAttribute('class', 'node-label');
    text.setAttribute('text-anchor', 'middle');
    text.textContent = label;

    node.appendChild(circle);
    node.appendChild(badge);
    node.appendChild(text);

    node.addEventListener('click', () => {
      if (onSelect) {
        onSelect(actor.id);
      }
    });

    nodesGroup.appendChild(node);
    nodesById.set(actor.id, { node, circle, actor });
  });

  function cssVar(name) {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
  }

  const statusColor = {
    pending: cssVar('--pending') || '#d4d8e2',
    active: cssVar('--warning') || '#f0c75e',
    completed: cssVar('--completed') || '#2e7d32',
    blocked: cssVar('--border') || '#c4c8d4',
  };

  function update(agentStatuses = new Map()) {
    const fallbackPending = statusColor.pending;

    nodesById.forEach(({ circle, node }, actorId) => {
      const statusInfo = agentStatuses.get(actorId) || { status: 'pending', steps: [] };
      const status = statusInfo.status || 'pending';
      const fill = statusColor[status] || fallbackPending;
      circle.setAttribute('fill', fill);
      circle.setAttribute('data-status', status);
      node.dataset.status = status;

      const stepCount = Array.isArray(statusInfo.steps) ? statusInfo.steps.length : 0;
      node.dataset.stepCount = String(stepCount);

      const prevStatus = statusByActor.get(actorId);
      statusByActor.set(actorId, status);
      if (prevStatus && prevStatus !== status) {
        node.classList.add('status-transition');
        window.setTimeout(() => {
          node.classList.remove('status-transition');
        }, 800);
      }
    });

    edges.forEach(({ element, rel }) => {
      const sourceStatus = agentStatuses.get(rel.source)?.status;
      const targetStatus = agentStatuses.get(rel.target)?.status;
      const isActive = ['active', 'completed'].includes(sourceStatus) || ['active', 'completed'].includes(targetStatus);
      element.classList.toggle('active', Boolean(isActive));
    });
  }

  function pulseAgent(agentId, { duration = 1600 } = {}) {
    const entry = nodesById.get(agentId);
    if (!entry) return;
    const { node } = entry;
    node.classList.add('pulse');
    if (node.parentNode) {
      node.parentNode.appendChild(node);
    }

    edges.forEach(({ element, rel }) => {
      if (rel.source === agentId || rel.target === agentId) {
        element.classList.add('edge-pulse');
        window.setTimeout(() => {
          element.classList.remove('edge-pulse');
        }, duration);
      }
    });

    window.setTimeout(() => {
      node.classList.remove('pulse');
    }, duration);
  }

  return {
    update,
    nodesById,
    pulseAgent,
  };
}
