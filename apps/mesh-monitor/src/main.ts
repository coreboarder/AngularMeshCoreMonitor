import { createServer } from 'node:http';
import { MeshStateStore } from '../../../libs/mesh/state/src/mesh-state.ts';
import { createMeshMonitorShellFromSnapshot } from './app-shell.ts';
import { renderDashboardPage } from './render-dashboard.ts';

const store = new MeshStateStore();
const port = Number(process.env['PORT'] ?? 4200);

function nextShell() {
  const snapshot = store.tick();
  return createMeshMonitorShellFromSnapshot(Array.from(snapshot.nodes.values()), snapshot.paths);
}

const server = createServer((request, response) => {
  const url = request.url ?? '/';

  if (url === '/api/state') {
    response.setHeader('content-type', 'application/json');
    response.end(JSON.stringify(nextShell(), null, 2));
    return;
  }

  const shell = nextShell();
  response.setHeader('content-type', 'text/html; charset=utf-8');
  response.end(renderDashboardPage(shell));
});

server.listen(port, () => {
  console.log(`Mesh monitor serving on http://localhost:${port}`);
  console.log(`Bootstrap branch: ${process.env['BOOTSTRAP_BRANCH'] ?? 'v6-dev'}`);
});
