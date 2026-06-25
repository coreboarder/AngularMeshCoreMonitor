import { MeshStateStore } from '@mesh/state';
import { createMeshMonitorShell } from './app-shell';

const store = new MeshStateStore();
const snapshot = store.tick();
const shell = createMeshMonitorShell(Array.from(snapshot.nodes.values()));

const processEnv = (globalThis as {
  process?: { env?: Record<string, string | undefined> };
}).process?.env ?? {};

console.log('Mesh monitor booted', {
  app: 'mesh-monitor',
  title: shell.title,
  nodeCount: shell.dashboard.nodeCount,
  grid: shell.dashboard.grid,
  selectedNode: shell.dashboard.selectedNode?.id,
  localeCount: shell.localeCount,
  perf: shell.perf,
  theme: shell.theme,
  bootstrapBranch: processEnv['BOOTSTRAP_BRANCH'] ?? 'v6-dev',
  bootedNodes: snapshot.nodes.size,
});
