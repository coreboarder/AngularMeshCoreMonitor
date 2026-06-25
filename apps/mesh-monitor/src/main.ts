import { createServer } from 'node:http';
import { MeshStateStore } from '../../../libs/mesh/state/src/mesh-state.ts';
import { createMeshMonitorShell } from './app-shell.ts';
import { renderDashboardPage } from './render-dashboard.ts';

const store = new MeshStateStore();
const snapshot = store.tick();
const shell = createMeshMonitorShell(Array.from(snapshot.nodes.values()));
const port = Number(process.env['PORT'] ?? 4200);

const server = createServer((request, response) => {
  const url = request.url ?? '/';

  if (url === '/api/bootstrap') {
    response.setHeader('content-type', 'application/json');
    response.end(JSON.stringify(shell, null, 2));
    return;
  }

  response.setHeader('content-type', 'text/html; charset=utf-8');
  response.end(renderDashboardPage(shell));
});

server.listen(port, () => {
  console.log(`Mesh monitor serving on http://localhost:${port}`);
  console.log(`Bootstrap branch: ${process.env['BOOTSTRAP_BRANCH'] ?? 'v6-dev'}`);
});
