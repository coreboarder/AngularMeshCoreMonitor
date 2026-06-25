import { MeshStreamGateway } from './server';

const gateway = new MeshStreamGateway({
  apiKey: process.env['MESH_API_KEY'] ?? 'local-dev-key',
  serialPath: process.env['MESH_SERIAL_PATH'],
  tcpUrl: process.env['MESH_TCP_URL'],
});

const store = gateway.start();
console.log('Mesh gateway ready', {
  sequence: store.tick().sequence,
});
