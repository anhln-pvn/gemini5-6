import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ACTORS, type Actor } from '../data/actors';
import { RELATIONSHIPS, type Relationship } from '../data/relationships';
import type { AgentStatusEntry, StepStatus } from '../lib/workflow';

interface LayoutNode {
  x: number;
  y: number;
  radius: number;
  color: string;
  actor: Actor;
}

interface GraphViewProps {
  agentStatuses: Map<string, AgentStatusEntry>;
  onSelect?: (actorId: string) => void;
  selectedActorId?: string | null;
  pulseAgents?: string[];
}

const CATEGORY_ORDER: Array<Actor['category']> = ['board', 'executive', 'division'];
const CATEGORY_Y: Record<Actor['category'], number> = {
  board: 120,
  executive: 320,
  division: 560,
};
const CATEGORY_RADIUS: Record<Actor['category'], number> = {
  board: 44,
  executive: 42,
  division: 40,
};
const CATEGORY_COLOR: Record<Actor['category'], string> = {
  board: 'var(--board)',
  executive: 'var(--executive)',
  division: 'var(--division)',
};

const STATUS_COLOR: Record<StepStatus, string> = {
  pending: 'var(--pending)',
  active: 'var(--warning)',
  completed: 'var(--completed)',
  blocked: 'var(--border)',
};

function computeLayout(actors: Actor[]) {
  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    nodes: actors.filter((actor) => actor.category === category),
  }));
  const maxCount = Math.max(1, ...grouped.map(({ nodes }) => nodes.length));
  const baseWidth = 1200;
  const margin = 120;
  const spacing = 120;
  const width = Math.max(baseWidth, margin * 2 + spacing * Math.max(0, maxCount - 1));

  const layout = new Map<string, LayoutNode>();

  grouped.forEach(({ category, nodes }) => {
    const count = nodes.length;
    const y = CATEGORY_Y[category];
    const usableWidth = width - margin * 2;
    nodes.forEach((actor, index) => {
      const step = count > 1 ? usableWidth / (count - 1) : 0;
      const x = count === 1 ? width / 2 : margin + step * index;
      layout.set(actor.id, {
        actor,
        x,
        y,
        radius: CATEGORY_RADIUS[category],
        color: CATEGORY_COLOR[category],
      });
    });
  });

  return {
    layout,
    width,
  };
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
}

export function GraphView({ agentStatuses, onSelect, selectedActorId, pulseAgents = [] }: GraphViewProps) {
  const { layout, width } = useMemo(() => computeLayout(ACTORS), []);
  const [pulsing, setPulsing] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!pulseAgents.length) return;
    setPulsing(new Set(pulseAgents));
    const timer = window.setTimeout(() => {
      setPulsing(new Set());
    }, 1600);
    return () => window.clearTimeout(timer);
  }, [pulseAgents]);

  const activeEdges = useMemo(() => {
    return new Set(
      RELATIONSHIPS.filter((rel) => {
        const sourceStatus = agentStatuses.get(rel.source)?.status;
        const targetStatus = agentStatuses.get(rel.target)?.status;
        return (
          sourceStatus === 'active' ||
          sourceStatus === 'completed' ||
          targetStatus === 'active' ||
          targetStatus === 'completed'
        );
      }).map((rel) => `${rel.source}-${rel.target}`),
    );
  }, [agentStatuses]);

  return (
    <div className="graph-card">
      <div className="card-header">
        <div>
          <h2>Bản đồ tác nhân PVN</h2>
          <p className="muted">Theo dõi tiến độ từng ban khi workflow chạy.</p>
        </div>
      </div>
      <svg
        viewBox={`0 0 ${width} 720`}
        role="img"
        aria-label="Sơ đồ tác nhân PVN"
        className="org-graph"
      >
        <defs>
          <marker id="arrowhead" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(47, 125, 52, 0.45)" />
          </marker>
        </defs>
        <g className="edges">
          {RELATIONSHIPS.map((rel) => {
            const source = layout.get(rel.source);
            const target = layout.get(rel.target);
            if (!source || !target) return null;
            const key = `${rel.source}-${rel.target}`;
            const active = activeEdges.has(key);
            return (
              <line
                key={key}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                className={`edge edge-${rel.type} ${active ? 'active' : ''} ${
                  pulsing.has(rel.source) || pulsing.has(rel.target) ? 'edge-pulse' : ''
                }`}
                markerEnd="url(#arrowhead)"
              />
            );
          })}
        </g>
        <g className="nodes">
          {ACTORS.map((actor) => {
            const node = layout.get(actor.id);
            if (!node) return null;
            const agentStatus = agentStatuses.get(actor.id)?.status ?? 'pending';
            const fill = STATUS_COLOR[agentStatus as StepStatus] ?? STATUS_COLOR.pending;
            const isSelected = selectedActorId === actor.id;
            const isPulsing = pulsing.has(actor.id);
            return (
              <g
                key={actor.id}
                className={`node node-${actor.category} ${isSelected ? 'selected' : ''} ${isPulsing ? 'pulse' : ''}`}
                tabIndex={0}
                role="button"
                onClick={() => onSelect?.(actor.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect?.(actor.id);
                  }
                }}
              >
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={node.radius}
                  initial={false}
                  animate={{ fill, stroke: node.color, scale: isSelected ? 1.05 : 1 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                  strokeWidth={3}
                />
                <text className="node-badge" x={node.x} y={node.y} textAnchor="middle" dominantBaseline="middle">
                  {initials(actor.name)}
                </text>
                <text className="node-label" x={node.x} y={node.y + node.radius + 18} textAnchor="middle">
                  {actor.name}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
