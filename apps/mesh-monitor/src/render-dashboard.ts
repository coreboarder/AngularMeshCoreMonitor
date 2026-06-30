import type { MeshMonitorShellViewModel } from './app-shell.ts';
import type { MeshNodeTelemetry } from '../../../libs/mesh/domain-models/src/index.ts';

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

  return [
    `<div class="mesh-node mesh-node--${tone}" data-node-id="${node.id}" data-node-health="${node.health}">`,
    `  <div class="mesh-node__index">${index + 1}</div>`,
    `  <div class="mesh-node__label">${node.label}</div>`,
    `  <div class="mesh-node__meta">${node.role} · ${node.signalStrength}% · ${node.packetCount} packets</div>`,
    '</div>',
  ].join('\n');
}

function nodeCenter(index: number, columns: number): { x: number; y: number } {
  const row = Math.floor(index / columns);
  const column = index % columns;
  return {
    x: ((column + 0.5) / columns) * 100,
    y: ((row + 0.5) / Math.ceil(250 / columns)) * 100,
  };
}

function renderTrafficOverlay(shell: MeshMonitorShellViewModel): string {
  const columns = shell.dashboard.grid.columns;
  const indexById = new Map(shell.nodes.map((node, index) => [node.id, index] as const));

  const paths = shell.paths.map((path) => {
    const sourceIndex = indexById.get(path.sourceId);
    const relayIndex = path.relayId ? indexById.get(path.relayId) : undefined;
    const destinationIndex = indexById.get(path.destinationId);

    if (sourceIndex === undefined || destinationIndex === undefined) {
      return '';
    }

    const source = nodeCenter(sourceIndex, columns);
    const destination = nodeCenter(destinationIndex, columns);
    const relay = relayIndex === undefined ? undefined : nodeCenter(relayIndex, columns);
    const controlPoint = relay ?? {
      x: (source.x + destination.x) / 2,
      y: Math.min(source.y, destination.y) - 2.5,
    };

    return [
      `<path class="mesh-path mesh-path--${path.phase}" data-path-id="${path.id}" d="M ${source.x.toFixed(2)} ${source.y.toFixed(2)} Q ${controlPoint.x.toFixed(2)} ${controlPoint.y.toFixed(2)} ${destination.x.toFixed(2)} ${destination.y.toFixed(2)}" />`,
      `<circle class="mesh-path__marker mesh-path__marker--source" cx="${source.x.toFixed(2)}" cy="${source.y.toFixed(2)}" r="0.5" />`,
      `<circle class="mesh-path__marker mesh-path__marker--destination" cx="${destination.x.toFixed(2)}" cy="${destination.y.toFixed(2)}" r="0.5" />`,
      relay ? `<circle class="mesh-path__marker mesh-path__marker--relay" cx="${relay.x.toFixed(2)}" cy="${relay.y.toFixed(2)}" r="0.5" />` : '',
    ].join('\n');
  }).filter(Boolean).join('\n');

  return `<svg class="mesh-flow" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <marker id="mesh-arrow" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto-start-reverse">
        <path d="M 0 0 L 4 2 L 0 4 z" fill="var(--accent)" />
      </marker>
    </defs>
    ${paths}
  </svg>`;
}

export function renderDashboardPage(shell: MeshMonitorShellViewModel): string {
  const totalCells = shell.dashboard.grid.rows * shell.dashboard.grid.columns;
  const cells = Array.from({ length: totalCells }, (_, index) => renderNodeCell(index, shell.nodes[index]));

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${shell.title}</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: ${shell.theme.surface};
        --bg-alt: ${shell.theme.surfaceAlt};
        --text: ${shell.theme.text};
        --accent: ${shell.theme.accent};
        --warning: ${shell.theme.warning};
        --critical: ${shell.theme.critical};
        --success: ${shell.theme.success};
      }
      body {
        margin: 0;
        font-family: Inter, Segoe UI, Arial, sans-serif;
        background: radial-gradient(circle at top, var(--bg-alt), var(--bg));
        color: var(--text);
      }
      .mesh-shell {
        padding: 24px;
        display: grid;
        gap: 16px;
      }
      .mesh-shell__header {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: center;
      }
      .mesh-shell__title {
        font-size: 28px;
        margin: 0;
      }
      .mesh-shell__meta {
        opacity: 0.8;
      }
      .mesh-panel {
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 20px;
        padding: 16px;
        backdrop-filter: blur(18px);
      }
      .mesh-network {
        position: relative;
      }
      .mesh-grid {
        display: grid;
        grid-template-columns: repeat(${shell.dashboard.grid.columns}, minmax(0, 1fr));
        gap: 10px;
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
        stroke: color-mix(in srgb, var(--accent) 80%, white 10%);
        stroke-width: 0.4;
        stroke-linecap: round;
        stroke-dasharray: 1.5 1.2;
        stroke-dashoffset: 0;
        marker-end: url(#mesh-arrow);
        animation: mesh-flow 2.8s linear infinite;
        opacity: 0.65;
      }
      .mesh-path--relay {
        stroke: color-mix(in srgb, var(--warning) 75%, white 10%);
      }
      .mesh-path--destination {
        stroke: color-mix(in srgb, var(--success) 85%, white 10%);
      }
      .mesh-path--source {
        stroke: color-mix(in srgb, var(--accent) 80%, white 10%);
      }
      .mesh-path__marker {
        fill: transparent;
      }
      @keyframes mesh-flow {
        from { stroke-dashoffset: 0; }
        to { stroke-dashoffset: -18; }
      }
      .mesh-node {
        min-height: 76px;
        border-radius: 16px;
        border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
        background: linear-gradient(180deg, color-mix(in srgb, var(--accent) 16%, transparent), transparent);
        padding: 10px;
        display: grid;
        align-content: space-between;
        transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
      }
      .mesh-node--healthy {
        box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--success) 30%, transparent);
      }
      .mesh-node--warning {
        box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--warning) 30%, transparent);
      }
      .mesh-node--critical {
        box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--critical) 35%, transparent);
      }
      .mesh-node--offline {
        opacity: 0.45;
      }
      .mesh-node--empty {
        opacity: 0.15;
      }
      .mesh-node__index {
        font-weight: 700;
        color: var(--accent);
      }
      .mesh-node__label {
        font-size: 12px;
        opacity: 0.8;
      }
      .mesh-node__meta {
        font-size: 11px;
        opacity: 0.68;
      }
      .mesh-kpis {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
      }
      .mesh-kpi {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 16px;
        padding: 12px;
      }
      .mesh-kpi__label {
        display: block;
        font-size: 12px;
        opacity: 0.7;
      }
      .mesh-kpi__value {
        font-size: 24px;
        font-weight: 700;
      }
    </style>
  </head>
  <body>
    <main class="mesh-shell">
      <header class="mesh-shell__header mesh-panel">
        <div>
          <h1 class="mesh-shell__title">${shell.title}</h1>
          <div class="mesh-shell__meta">${shell.localeCount} locales • Bootstrap ${shell.theme.mode} mode • v6-dev baseline</div>
        </div>
        <div>${shell.dashboard.nodeCount} nodes ready</div>
      </header>
      <section class="mesh-panel mesh-kpis">
        <div class="mesh-kpi"><span class="mesh-kpi__label">FPS</span><span class="mesh-kpi__value">${shell.perf.fps}</span></div>
        <div class="mesh-kpi"><span class="mesh-kpi__label">Events/s</span><span class="mesh-kpi__value">${shell.perf.eventRate}</span></div>
        <div class="mesh-kpi"><span class="mesh-kpi__label">Render ms</span><span class="mesh-kpi__value">${shell.perf.renderLatencyMs}</span></div>
        <div class="mesh-kpi"><span class="mesh-kpi__label">Latency ms</span><span class="mesh-kpi__value">${shell.perf.endToEndLatencyMs}</span></div>
      </section>
      <section class="mesh-panel mesh-network">
        ${renderTrafficOverlay(shell)}
        <div class="mesh-grid">
          ${cells.join('\n')}
        </div>
      </section>
    </main>
    <script>
      const refresh = async () => {
        const response = await fetch('/api/state', { headers: { accept: 'application/json' } });
        const shell = await response.json();

        document.querySelector('.mesh-shell__meta').textContent = shell.localeCount + ' locales • Bootstrap ' + shell.theme.mode + ' mode • v6-dev baseline';
        document.querySelectorAll('.mesh-kpi__value')[0].textContent = shell.perf.fps;
        document.querySelectorAll('.mesh-kpi__value')[1].textContent = shell.perf.eventRate;
        document.querySelectorAll('.mesh-kpi__value')[2].textContent = shell.perf.renderLatencyMs;
        document.querySelectorAll('.mesh-kpi__value')[3].textContent = shell.perf.endToEndLatencyMs;

        const nodes = shell.nodes ?? [];
        document.querySelectorAll('[data-node-id]').forEach((element) => {
          const nodeId = element.getAttribute('data-node-id');
          const node = nodes.find((candidate) => candidate.id === nodeId);
          if (!node) {
            return;
          }

          element.setAttribute('data-node-health', node.health);
          element.className = 'mesh-node mesh-node--' + node.health;
          element.querySelector('.mesh-node__label').textContent = node.label;
          element.querySelector('.mesh-node__meta').textContent = node.role + ' · ' + node.signalStrength + '% · ' + node.packetCount + ' packets';
        });
      };

      refresh();
      setInterval(refresh, 1500);
    </script>
  </body>
</html>`;
}
