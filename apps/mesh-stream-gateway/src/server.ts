import { MeshStateStore } from '@mesh/state';

export interface GatewayConfig {
  apiKey: string;
  serialPath?: string;
  tcpUrl?: string;
}

export class MeshStreamGateway {
  constructor(private readonly config: GatewayConfig) {}

  start(): MeshStateStore {
    if (!this.config.apiKey) {
      throw new Error('Missing apiKey in gateway config');
    }

    return new MeshStateStore();
  }
}
