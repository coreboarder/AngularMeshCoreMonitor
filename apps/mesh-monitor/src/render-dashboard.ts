import type { MeshMonitorShellViewModel } from './app-shell.ts';

function renderNodeCell(index: number, nodeId?: string): string {
  if (!nodeId) {
    return '<div class="mesh-node mesh-node--empty"></div>';
  }

  return [
    '<div class="mesh-node">',
    `  <div class="mesh-node__index">${index + 1}</div>`,
    `  <div class="mesh-node__label">${nodeId}</div>`,
    '</div>',
  ].join('\n');
}

export function renderDashboardPage(shell: MeshMonitorShellViewModel): string {
  const totalCells = shell.dashboard.grid.rows * shell.dashboard.grid.columns;
  const cells = Array.from({ length: totalCells }, (_, index) => renderNodeCell(index, shell.nodes[index]?.id));

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
      .mesh-grid {
        display: grid;
        grid-template-columns: repeat(${shell.dashboard.grid.columns}, minmax(0, 1fr));
        gap: 10px;
      }
      .mesh-node {
        min-height: 76px;
        border-radius: 16px;
        border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
        background: linear-gradient(180deg, color-mix(in srgb, var(--accent) 16%, transparent), transparent);
        padding: 10px;
        display: grid;
        align-content: space-between;
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
      <section class="mesh-panel">
        <div class="mesh-grid">
          ${cells.join('\n')}
        </div>
      </section>
    </main>
  </body>
</html>`;
}
