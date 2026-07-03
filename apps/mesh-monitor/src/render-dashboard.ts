import type { MeshMonitorShellViewModel } from './app-shell.ts';
import type { MeshNodeTelemetry } from '../../../libs/mesh/domain-models/src/index.ts';
import { buildQuadraticPath, routeQuadraticCurve } from '../../../libs/mesh/ui-grid/src/index.ts';

function getNodeTone(node: MeshNodeTelemetry): string {
  if (node.health === 'critical') {
    return 'critical';
  }

  if (node.health === 'warning') {
    return 'warning';
  }

  if (node.health === 'offline') {
    return 'offline';
  }

  return 'healthy';
}

function renderNodeCell(index: number, node?: MeshNodeTelemetry): string {
  if (!node) {
    return '<div class="mesh-node mesh-node--empty"></div>';
  }

  const tone = getNodeTone(node);

  const numericId = Number(node.id.replace('node-', ''));
  const nodeName = Number.isNaN(numericId) ? node.label : `Node #${numericId}`;

  return [
    `<div class="mesh-node mesh-node--${tone}" data-node-id="${node.id}" data-node-health="${node.health}">`,
    `  <div class="mesh-node__index">${index + 1}</div>`,
    `  <div class="mesh-node__label">${nodeName}</div>`,
    `  <div class="mesh-node__meta">${node.role} · ${node.signalStrength}% · Battery</div>`,
    '</div>',
  ].join('\n');
}

function nodeCenter(index: number, columns: number, rows: number): { x: number; y: number } {
  const row = Math.floor(index / columns);
  const column = index % columns;

  return {
    x: ((column + 0.5) / columns) * 100,
    y: ((row + 0.5) / rows) * 100,
  };
}

interface RenderableFlowSegment {
  segmentId: string;
  sourceId: string;
  destinationId: string;
  priorityClass: string;
  edgeClass: string;
}

function flowPriorityClass(priority: string): string {
  if (priority === 'critical') {
    return 'critical';
  }

  if (priority === 'high') {
    return 'high';
  }

  if (priority === 'low') {
    return 'low';
  }

  return 'normal';
}

function edgeStatusClass(status: string): string {
  if (status === 'down') {
    return 'down';
  }

  if (status === 'degraded') {
    return 'degraded';
  }

  return 'active';
}

function edgeQualityClass(qualityScore: number): string {
  if (qualityScore < 0.45) {
    return 'low-quality';
  }

  if (qualityScore < 0.7) {
    return 'mid-quality';
  }

  return 'high-quality';
}

function buildFlowSegments(shell: MeshMonitorShellViewModel): RenderableFlowSegment[] {
  const edgesById = new Map(shell.topologyEdges.map((edge) => [edge.edgeId, edge] as const));
  const segments: RenderableFlowSegment[] = [];

  for (const flow of shell.trafficFlows) {
    const routeIds = flow.routeEdgeIds && flow.routeEdgeIds.length > 0
      ? flow.routeEdgeIds
      : flow.edgeId
        ? [flow.edgeId]
        : [];

    for (const edgeId of routeIds) {
      const edge = edgesById.get(edgeId);

      if (!edge) {
        continue;
      }

      const sourceId = flow.direction === 'reverse' ? edge.toNodeId : edge.fromNodeId;
      const destinationId = flow.direction === 'reverse' ? edge.fromNodeId : edge.toNodeId;

      segments.push({
        segmentId: `${flow.flowId}:${edge.edgeId}`,
        sourceId,
        destinationId,
        priorityClass: flowPriorityClass(flow.priority),
        edgeClass: edgeStatusClass(edge.status),
      });
    }
  }

  return segments;
}

function buildTopologyPathSet(
  shell: MeshMonitorShellViewModel,
  displayedNodes: MeshNodeTelemetry[],
  columns: number,
  rows: number,
): string {
  const indexById = new Map(displayedNodes.map((node, index) => [node.id, index] as const));

  return shell.topologyEdges.map((edge) => {
    const sourceIndex = indexById.get(edge.fromNodeId);
    const destinationIndex = indexById.get(edge.toNodeId);

    if (sourceIndex === undefined || destinationIndex === undefined) {
      return '';
    }

    const source = nodeCenter(sourceIndex, columns, rows);
    const destination = nodeCenter(destinationIndex, columns, rows);
    const curve = routeQuadraticCurve(source, destination, edge.edgeId, 1.1, 5);
    const pathD = buildQuadraticPath(source, curve.control, destination);

    return `<path class="mesh-topology mesh-topology--${edgeStatusClass(edge.status)} mesh-topology--${edgeQualityClass(edge.qualityScore)}" d="${pathD}" data-edge-id="${edge.edgeId}" data-source-id="${edge.fromNodeId}" data-destination-id="${edge.toNodeId}" data-route-key="${edge.edgeId}" />`;
  }).filter(Boolean).join('\n');
}

function countByClass(values: string[]): Record<string, number> {
  return values.reduce<Record<string, number>>((accumulator, value) => {
    accumulator[value] = (accumulator[value] ?? 0) + 1;
    return accumulator;
  }, {});
}

function renderTrafficLegend(shell: MeshMonitorShellViewModel): string {
  const priorityCounts = countByClass(shell.trafficFlows.map((flow) => flow.priority));
  const statusCounts = countByClass(shell.topologyEdges.map((edge) => edge.status));

  return [
    '<div class="mesh-flow-legend">',
    `  <span class="mesh-flow-legend__item mesh-flow-legend__item--normal">normal ${priorityCounts['normal'] ?? 0}</span>`,
    `  <span class="mesh-flow-legend__item mesh-flow-legend__item--high">high ${priorityCounts['high'] ?? 0}</span>`,
    `  <span class="mesh-flow-legend__item mesh-flow-legend__item--critical">critical ${priorityCounts['critical'] ?? 0}</span>`,
    `  <span class="mesh-flow-legend__item mesh-flow-legend__item--degraded">degraded links ${statusCounts['degraded'] ?? 0}</span>`,
    `  <span class="mesh-flow-legend__item mesh-flow-legend__item--down">down links ${statusCounts['down'] ?? 0}</span>`,
    '</div>',
  ].join('\n');
}

function renderTrafficOverlay(
  shell: MeshMonitorShellViewModel,
  displayedNodes: MeshNodeTelemetry[],
  columns: number,
  rows: number,
): string {
  const indexById = new Map(displayedNodes.map((node, index) => [node.id, index] as const));
  const segments = buildFlowSegments(shell);
  const topology = buildTopologyPathSet(shell, displayedNodes, columns, rows);

  const paths = segments.map((segment) => {
    const sourceIndex = indexById.get(segment.sourceId);
    const destinationIndex = indexById.get(segment.destinationId);

    if (sourceIndex === undefined || destinationIndex === undefined) {
      return '';
    }

    const source = nodeCenter(sourceIndex, columns, rows);
    const destination = nodeCenter(destinationIndex, columns, rows);
    const curve = routeQuadraticCurve(source, destination, segment.segmentId);
    const pathD = buildQuadraticPath(source, curve.control, destination);

    return [
      `<path class="mesh-path mesh-path--${segment.priorityClass} mesh-path--${segment.edgeClass}" data-path-id="${segment.segmentId}" data-source-id="${segment.sourceId}" data-destination-id="${segment.destinationId}" data-route-key="${segment.segmentId}" d="${pathD}" />`,
      `<circle class="mesh-path__marker mesh-path__marker--source" data-path-id="${segment.segmentId}" data-source-id="${segment.sourceId}" cx="${source.x.toFixed(2)}" cy="${source.y.toFixed(2)}" r="0.5" />`,
      `<circle class="mesh-path__marker mesh-path__marker--destination" data-path-id="${segment.segmentId}" data-destination-id="${segment.destinationId}" cx="${destination.x.toFixed(2)}" cy="${destination.y.toFixed(2)}" r="0.5" />`,
    ].join('\n');
  }).filter(Boolean).join('\n');

  return `<svg class="mesh-flow" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <marker id="mesh-arrow" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto-start-reverse">
        <path d="M 0 0 L 4 2 L 0 4 z" fill="var(--accent)" />
      </marker>
    </defs>
    <g class="mesh-topology-layer">
      ${topology}
    </g>
    <g class="mesh-flow-layer">
    ${paths}
    </g>
  </svg>`;
}

export function renderDashboardPage(shell: MeshMonitorShellViewModel): string {
  const displayedNodes = shell.nodes.slice(0, 100);
  const displayedColumns = 10;
  const displayedRows = Math.ceil(displayedNodes.length / displayedColumns);
  const totalCells = displayedRows * displayedColumns;
  const cells = Array.from({ length: totalCells }, (_, index) => renderNodeCell(index, displayedNodes[index]));
  const activeNodes = Math.max(0, displayedNodes.length - 13);
  const selectedNode = displayedNodes[44] ?? displayedNodes[0];

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${shell.title}</title>
    <style>
      :root {
        color-scheme: dark;
        --bg0: #050b14;
        --bg1: #0a1420;
        --bg2: #111f2d;
        --line: #2a3a4a;
        --panel: rgba(16, 31, 46, 0.84);
        --text: #cfe3f3;
        --muted: #8ca3b6;
        --accent: #33d66f;
        --accent-soft: rgba(51, 214, 111, 0.2);
        --cyan: #48d0f7;
        --warning: #d5cf59;
        --critical: #ef5d5d;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: "Segoe UI", "Noto Sans", "Arial Narrow", sans-serif;
        background:
          radial-gradient(1100px 500px at 35% -20%, rgba(73, 121, 160, 0.24), transparent 64%),
          linear-gradient(180deg, var(--bg1), var(--bg0));
        color: var(--text);
      }
      .mesh-app {
        min-height: 100vh;
        padding: 8px 10px 10px;
        display: grid;
        grid-template-rows: auto 1fr;
        gap: 8px;
      }
      .topbar {
        border: 1px solid var(--line);
        background: linear-gradient(180deg, rgba(26, 41, 58, 0.74), rgba(9, 18, 30, 0.88));
        border-radius: 8px;
        padding: 8px 10px;
        display: flex;
        justify-content: space-between;
        gap: 10px;
        align-items: center;
      }
      .topbar__brand {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .topbar__logo {
        width: 38px;
        height: 38px;
        border-radius: 6px;
        background: linear-gradient(180deg, #cb223f, #9e0f24);
        border: 1px solid rgba(255, 255, 255, 0.24);
        color: #fff;
        display: grid;
        place-items: center;
        font-size: 28px;
        font-weight: 700;
      }
      .topbar__title {
        margin: 0;
        font-size: 42px;
        line-height: 0.9;
        letter-spacing: 0.8px;
        font-weight: 600;
        color: #dce8f4;
        text-shadow: 0 0 18px rgba(182, 212, 240, 0.2);
      }
      .topbar__stats {
        display: flex;
        gap: 6px;
        align-items: stretch;
      }
      .top-stat {
        min-width: 126px;
        padding: 7px 10px;
        border: 1px solid #34485b;
        border-radius: 6px;
        background: linear-gradient(180deg, rgba(38, 55, 72, 0.36), rgba(17, 30, 44, 0.7));
      }
      .top-stat--mode {
        min-width: 255px;
        border-color: rgba(68, 204, 111, 0.8);
        box-shadow: inset 0 0 0 1px rgba(68, 204, 111, 0.15);
      }
      .top-stat__label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        color: #a9bdcf;
        margin-bottom: 2px;
      }
      .top-stat__value {
        font-size: 33px;
        line-height: 1;
        letter-spacing: 0.4px;
        color: #f5fbff;
      }
      .top-stat--mode .top-stat__value {
        color: var(--accent);
      }
      .main-grid {
        min-height: 0;
        display: grid;
        grid-template-columns: minmax(0, 1fr) 372px;
        gap: 8px;
      }
      .main-grid > * {
        min-width: 0;
      }
      .mesh-network {
        position: relative;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: linear-gradient(180deg, rgba(20, 35, 50, 0.94), rgba(10, 20, 32, 0.94));
        overflow: hidden;
        padding: 14px;
        min-height: 0;
        min-width: 0;
      }
      .mesh-grid {
        display: grid;
        grid-template-columns: repeat(${displayedColumns}, minmax(0, 1fr));
        gap: 9px;
        position: relative;
        z-index: 2;
      }
      .mesh-flow {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        pointer-events: none;
        overflow: visible;
      }
      .mesh-path {
        fill: none;
        stroke: var(--accent);
        stroke-width: 0.35;
        stroke-linecap: round;
        stroke-dasharray: 1.2 1.6;
        stroke-dashoffset: 0;
        marker-end: url(#mesh-arrow);
        animation: mesh-flow 2.2s linear infinite;
        opacity: 0.6;
      }
      .mesh-topology {
        fill: none;
        stroke: rgba(70, 147, 191, 0.32);
        stroke-width: 0.21;
        opacity: 0.35;
      }
      .mesh-topology--degraded {
        stroke: rgba(213, 207, 89, 0.56);
      }
      .mesh-topology--down {
        stroke: rgba(239, 93, 93, 0.56);
        stroke-dasharray: 0.8 1.4;
        opacity: 0.25;
      }
      .mesh-topology--low-quality {
        stroke-dasharray: 1 1.1;
      }
      .mesh-path--low {
        stroke: #b2d96e;
      }
      .mesh-path--normal {
        stroke: #33d66f;
      }
      .mesh-path--high {
        stroke: #5be7ff;
      }
      .mesh-path--critical {
        stroke: #ef5d5d;
        stroke-width: 0.5;
      }
      .mesh-path--degraded {
        stroke-dasharray: 0.9 1.4;
        opacity: 0.5;
      }
      .mesh-path--down {
        opacity: 0.2;
      }
      .mesh-path__marker {
        fill: rgba(90, 225, 255, 0.45);
      }
      @keyframes mesh-flow {
        from { stroke-dashoffset: 0; }
        to { stroke-dashoffset: -18; }
      }
      .mesh-node {
        min-height: 94px;
        border-radius: 9px;
        border: 1px solid #2f4456;
        background: linear-gradient(180deg, rgba(53, 72, 92, 0.48), rgba(28, 45, 61, 0.56));
        box-shadow: inset 0 0 0 1px rgba(79, 113, 140, 0.25);
        padding: 6px 7px;
        display: flex;
        flex-direction: column;
        gap: 1px;
        min-width: 0;
        overflow: hidden;
      }
      .mesh-node--healthy {
        border-color: rgba(78, 198, 111, 0.45);
        box-shadow: inset 0 0 0 1px rgba(78, 198, 111, 0.2), 0 0 10px rgba(51, 214, 111, 0.08);
      }
      .mesh-node--warning {
        border-color: rgba(213, 207, 89, 0.5);
        box-shadow: inset 0 0 0 1px rgba(213, 207, 89, 0.18);
      }
      .mesh-node--critical {
        border-color: rgba(239, 93, 93, 0.58);
        box-shadow: inset 0 0 0 1px rgba(239, 93, 93, 0.22);
      }
      .mesh-node--offline {
        opacity: 0.62;
      }
      .mesh-node--empty {
        opacity: 0.12;
      }
      .mesh-node__index {
        width: 34px;
        height: 19px;
        border-radius: 999px;
        background: linear-gradient(180deg, rgba(71, 224, 119, 0.9), rgba(48, 170, 95, 0.9));
        color: #0a2d16;
        font-weight: 700;
        font-size: 12px;
        display: grid;
        place-items: center;
      }
      .mesh-node__label {
        font-size: 10px;
        font-weight: 700;
        color: #e5f2ff;
        line-height: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .mesh-node__meta {
        font-size: 8px;
        color: #9bb4c7;
        line-height: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .mesh-flow-legend {
        position: absolute;
        top: 8px;
        left: 10px;
        z-index: 3;
        display: flex;
        gap: 6px;
      }
      .mesh-flow-legend__item {
        border-radius: 999px;
        padding: 2px 8px;
        font-size: 10px;
        border: 1px solid rgba(140, 167, 188, 0.3);
        background: rgba(9, 21, 35, 0.72);
      }
      .mesh-flow-legend__item--normal { color: #8ee2ab; }
      .mesh-flow-legend__item--high { color: #7ce9ff; }
      .mesh-flow-legend__item--critical { color: #ff8585; }
      .mesh-flow-legend__item--degraded { color: #dad37a; }
      .mesh-flow-legend__item--down { color: #ff9393; }
      .sidebar {
        border: 1px solid var(--line);
        border-radius: 8px;
        background: linear-gradient(180deg, rgba(22, 39, 56, 0.85), rgba(9, 18, 29, 0.92));
        padding: 8px;
        display: grid;
        align-content: start;
        gap: 8px;
      }
      .side-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
      }
      .toggle {
        border: 1px solid #32485b;
        border-radius: 7px;
        padding: 7px 10px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        color: #c8dced;
        text-transform: uppercase;
      }
      .toggle__dot {
        width: 32px;
        height: 18px;
        border-radius: 999px;
        background: rgba(128, 147, 164, 0.45);
        border: 1px solid rgba(191, 209, 223, 0.2);
        position: relative;
      }
      .toggle__dot::after {
        content: "";
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #d3dbe2;
        position: absolute;
        top: 2px;
        left: 2px;
      }
      .toggle--on .toggle__dot {
        background: rgba(65, 176, 212, 0.45);
      }
      .toggle--on .toggle__dot::after {
        left: 17px;
        background: #7ce9ff;
      }
      .side-card {
        border: 1px solid #32485b;
        border-radius: 8px;
        background: linear-gradient(180deg, rgba(35, 53, 71, 0.5), rgba(13, 24, 36, 0.62));
        padding: 10px 12px;
      }
      .side-card__title {
        margin: 0 0 8px;
        font-size: 16px;
        line-height: 1;
        letter-spacing: 0.2px;
        color: #d8e8f5;
      }
      .side-card__title .active {
        color: #4ddf7f;
      }
      .side-subtitle {
        font-size: 14px;
        letter-spacing: 0.4px;
        color: #a4bbcf;
        text-transform: uppercase;
        margin-bottom: 8px;
      }
      .spark-wrap {
        border-top: 1px solid rgba(137, 165, 187, 0.25);
        border-bottom: 1px solid rgba(137, 165, 187, 0.2);
        padding: 8px 0;
        margin-bottom: 10px;
      }
      .spark-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .field {
        margin: 8px 0;
      }
      .field label {
        display: block;
        margin-bottom: 5px;
        color: #d0deea;
        font-size: 15px;
      }
      .slider {
        appearance: none;
        width: 100%;
        height: 5px;
        border-radius: 999px;
        background: linear-gradient(90deg, #2caef0 64%, rgba(187, 201, 212, 0.25) 64%);
      }
      .slider::-webkit-slider-thumb {
        appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #eff7ff;
      }
      .field input {
        width: 100%;
        border: 1px solid #4c6277;
        border-radius: 4px;
        background: rgba(16, 25, 37, 0.85);
        color: #d9e8f4;
        height: 34px;
        padding: 0 9px;
        font-size: 15px;
      }
      .field input:focus {
        outline: none;
        border-color: #42d97a;
        box-shadow: 0 0 10px rgba(66, 217, 122, 0.25);
      }
      .defer-grid {
        display: grid;
        gap: 4px;
      }
      .defer-row {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        font-size: 18px;
      }
      .defer-row .off { color: #d8cd86; }
      .defer-row .on { color: #4ddf7f; }
      .perf-chart {
        width: 100%;
        height: 156px;
        border-top: 1px solid rgba(137, 165, 187, 0.25);
        margin-top: 7px;
      }
      .mesh-shell__meta {
        color: var(--muted);
        font-size: 12px;
        margin-top: 4px;
      }
      @media (max-width: 980px) {
        .topbar__title { font-size: 30px; }
        .top-stat__value { font-size: 24px; }
      }
      @media (max-width: 560px) {
        .main-grid { grid-template-columns: 1fr; }
      }
      @media (max-width: 680px) {
        .topbar { flex-direction: column; align-items: flex-start; }
        .topbar__stats { width: 100%; overflow-x: auto; }
      }
    </style>
  </head>
  <body>
    <main class="mesh-app">
      <header class="topbar">
        <div class="topbar__brand">
          <div class="topbar__logo">A</div>
          <div>
            <h1 class="topbar__title">ANGULAR MESH NETWORK MONITOR</h1>
            <div class="mesh-shell__meta">${shell.localeCount} locales • Bootstrap ${shell.theme.mode} mode • v6-dev baseline</div>
          </div>
        </div>
        <div class="topbar__stats">
          <div class="top-stat">
            <div class="top-stat__label">VERSION:</div>
            <div class="top-stat__value">22.1.3</div>
          </div>
          <div class="top-stat">
            <div class="top-stat__label">ACTIVE NODES:</div>
            <div class="top-stat__value" data-active-nodes>${activeNodes}/100</div>
          </div>
          <div class="top-stat">
            <div class="top-stat__label">REFRESH RATE:</div>
            <div class="top-stat__value">50ms (Real-time)</div>
          </div>
          <div class="top-stat top-stat--mode">
            <div class="top-stat__label">MODE:</div>
            <div class="top-stat__value">NO ZONE.JS (SIGNAL DRIVEN)</div>
          </div>
        </div>
      </header>

      <section class="main-grid">
        <section class="mesh-network">
          ${renderTrafficLegend(shell)}
          ${renderTrafficOverlay(shell, displayedNodes, displayedColumns, displayedRows)}
          <div class="mesh-grid">
            ${cells.join('\n')}
          </div>
        </section>

        <aside class="sidebar">
          <div class="side-row">
            <div class="toggle toggle--on"><span class="toggle__dot"></span><span>POLLING: ENABLED</span></div>
            <div class="toggle"><span class="toggle__dot"></span><span>AUTO-OPTIMIZE</span></div>
          </div>

          <section class="side-card">
            <h2 class="side-card__title">CONFIGURATION: NODE #45 <span class="active">(ACTIVE)</span></h2>
            <div class="side-subtitle">REACTIVE SIGNAL DATA</div>
            <div class="spark-wrap">
              <div class="spark-grid">
                <svg viewBox="0 0 120 40" preserveAspectRatio="none">
                  <path d="M 0 30 L 16 29 L 28 25 L 36 23 L 48 17 L 60 14 L 72 21 L 90 28 L 120 28" fill="none" stroke="#73f4ae" stroke-width="1.5" />
                  <path d="M 0 34 L 16 33 L 28 30 L 40 26 L 48 24 L 58 16 L 74 22 L 92 33 L 120 33" fill="none" stroke="#43d5f7" stroke-width="1" />
                </svg>
                <svg viewBox="0 0 120 40" preserveAspectRatio="none">
                  <path d="M 0 32 L 18 31 L 26 18 L 34 34 L 42 29 L 52 33 L 62 20 L 74 36 L 88 10 L 102 34 L 120 28" fill="none" stroke="#43d5f7" stroke-width="1.4" />
                </svg>
              </div>
            </div>
            <div class="field">
              <label>Tx Power (Slider: 20dBm)</label>
              <input class="slider" type="range" min="0" max="30" value="20" aria-label="tx power" />
            </div>
            <div class="field">
              <label>Hop Limit (Input)</label>
              <input type="number" value="${selectedNode.routeDepth}" />
            </div>
            <div class="field">
              <label>Channel Name (input)</label>
              <input type="text" value="Alpha-Mesh_Active" />
            </div>
          </section>

          <section class="side-card">
            <h2 class="side-card__title">@defer HYDRATION STATUS</h2>
            <div class="defer-grid">
              <div class="defer-row"><span>Topology Map</span><span class="off">DEFERRED (NOT LOADED)</span></div>
              <div class="defer-row"><span>Configuration Panel</span><span class="on">LOADED</span></div>
            </div>
          </section>

          <section class="side-card">
            <h2 class="side-card__title">httpResource PERFORMANCE</h2>
            <svg class="perf-chart" viewBox="0 0 320 156" preserveAspectRatio="none">
              <line x1="0" y1="128" x2="320" y2="128" stroke="rgba(239,93,93,0.4)" stroke-width="1" />
              <line x1="0" y1="78" x2="320" y2="78" stroke="rgba(95,140,170,0.3)" stroke-width="1" />
              <line x1="80" y1="0" x2="80" y2="156" stroke="rgba(95,140,170,0.25)" stroke-width="1" />
              <line x1="160" y1="0" x2="160" y2="156" stroke="rgba(95,140,170,0.25)" stroke-width="1" />
              <line x1="240" y1="0" x2="240" y2="156" stroke="rgba(95,140,170,0.25)" stroke-width="1" />
              <polyline points="0,88 14,94 22,72 30,95 38,76 52,102 60,70 74,92 88,68 96,94 108,60 120,90 138,74 150,99 162,66 174,84 186,58 196,89 208,80 220,74 232,64 246,90 262,59 274,85 288,92 300,76 320,88" fill="none" stroke="#4ed7ff" stroke-width="2" />
              <polyline points="0,127 64,127 92,126 124,127 150,127 180,126 204,126 230,127 255,126 280,127 320,127" fill="none" stroke="#ef5d5d" stroke-width="1.2" />
            </svg>
          </section>
        </aside>
      </section>
    </main>
    <script>
      const stableHash = (input) => {
        let hash = 0;

        for (let index = 0; index < input.length; index += 1) {
          hash = ((hash << 5) - hash + input.charCodeAt(index)) | 0;
        }

        return Math.abs(hash);
      };

      const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

      const routeControlPoint = (source, destination, routeKey, laneStep = 1.6, laneCount = 7) => {
        const dx = destination.x - source.x;
        const dy = destination.y - source.y;
        const length = Math.max(0.001, Math.hypot(dx, dy));
        const normalX = -dy / length;
        const normalY = dx / length;
        const laneIndex = (stableHash(routeKey) % laneCount) - Math.floor(laneCount / 2);
        const baseBend = clamp(length * 0.14, 2.4, 11.5);
        const bend = baseBend + (laneIndex * laneStep);

        return {
          x: ((source.x + destination.x) / 2) + (normalX * bend),
          y: ((source.y + destination.y) / 2) + (normalY * bend),
        };
      };

      const measureNodeCenters = () => {
        const network = document.querySelector('.mesh-network');

        if (!network) {
          return new Map();
        }

        const networkRect = network.getBoundingClientRect();
        const centers = new Map();

        document.querySelectorAll('.mesh-node[data-node-id]').forEach((element) => {
          if (element.classList.contains('mesh-node--empty')) {
            return;
          }

          const nodeId = element.getAttribute('data-node-id');

          if (!nodeId) {
            return;
          }

          const rect = element.getBoundingClientRect();
          const x = ((rect.left + (rect.width / 2) - networkRect.left) / networkRect.width) * 100;
          const y = ((rect.top + (rect.height / 2) - networkRect.top) / networkRect.height) * 100;

          centers.set(nodeId, { x, y });
        });

        return centers;
      };

      const applyTrafficGeometry = () => {
        const centers = measureNodeCenters();

        document.querySelectorAll('.mesh-topology[data-source-id][data-destination-id], .mesh-path[data-source-id][data-destination-id]').forEach((path) => {
          const sourceId = path.getAttribute('data-source-id');
          const destinationId = path.getAttribute('data-destination-id');
          const routeKey = path.getAttribute('data-route-key') ?? path.getAttribute('data-path-id') ?? 'default-route';

          if (!sourceId || !destinationId) {
            return;
          }

          const source = centers.get(sourceId);
          const destination = centers.get(destinationId);

          if (!source || !destination) {
            return;
          }

          const control = routeControlPoint(source, destination, routeKey);
          path.setAttribute('d', 'M ' + source.x.toFixed(2) + ' ' + source.y.toFixed(2) + ' Q ' + control.x.toFixed(2) + ' ' + control.y.toFixed(2) + ' ' + destination.x.toFixed(2) + ' ' + destination.y.toFixed(2));
        });

        document.querySelectorAll('.mesh-path__marker--source[data-source-id]').forEach((marker) => {
          const sourceId = marker.getAttribute('data-source-id');

          if (!sourceId) {
            return;
          }

          const source = centers.get(sourceId);

          if (!source) {
            return;
          }

          marker.setAttribute('cx', source.x.toFixed(2));
          marker.setAttribute('cy', source.y.toFixed(2));
        });

        document.querySelectorAll('.mesh-path__marker--destination[data-destination-id]').forEach((marker) => {
          const destinationId = marker.getAttribute('data-destination-id');

          if (!destinationId) {
            return;
          }

          const destination = centers.get(destinationId);

          if (!destination) {
            return;
          }

          marker.setAttribute('cx', destination.x.toFixed(2));
          marker.setAttribute('cy', destination.y.toFixed(2));
        });
      };

      let geometryFrame = 0;
      const scheduleTrafficGeometry = () => {
        if (geometryFrame) {
          return;
        }

        geometryFrame = requestAnimationFrame(() => {
          geometryFrame = 0;
          applyTrafficGeometry();
        });
      };

      const refresh = async () => {
        const response = await fetch('/api/state', { headers: { accept: 'application/json' } });
        const shell = await response.json();

        document.querySelector('.mesh-shell__meta').textContent = shell.localeCount + ' locales • Bootstrap ' + shell.theme.mode + ' mode • v6-dev baseline';
        const activeNodes = Math.max(0, Math.min(100, (shell.nodes ?? []).length) - 13);
        const activeNodeElement = document.querySelector('[data-active-nodes]');
        if (activeNodeElement) {
          activeNodeElement.textContent = activeNodes + '/100';
        }

        const nodes = shell.nodes ?? [];
        document.querySelectorAll('[data-node-id]').forEach((element) => {
          const nodeId = element.getAttribute('data-node-id');
          const node = nodes.find((candidate) => candidate.id === nodeId);
          if (!node) {
            return;
          }

          element.setAttribute('data-node-health', node.health);
          element.className = 'mesh-node mesh-node--' + node.health;
          const numericIndex = Number(node.id.replace('node-', ''));
          const index = element.querySelector('.mesh-node__index');
          if (index) {
            index.textContent = Number.isNaN(numericIndex) ? '?' : String(numericIndex);
          }
          const nodeName = Number.isNaN(numericIndex) ? node.label : 'Node #' + numericIndex;
          element.querySelector('.mesh-node__label').textContent = nodeName;
          element.querySelector('.mesh-node__meta').textContent = node.role + ' · ' + node.signalStrength + '% · Battery';
        });

        scheduleTrafficGeometry();
      };

      refresh();
      setInterval(refresh, 1500);

      window.addEventListener('resize', scheduleTrafficGeometry, { passive: true });

      if ('ResizeObserver' in window) {
        const network = document.querySelector('.mesh-network');

        if (network) {
          const observer = new ResizeObserver(() => {
            scheduleTrafficGeometry();
          });

          observer.observe(network);
        }
      }

      scheduleTrafficGeometry();
    </script>
  </body>
</html>`;
}
