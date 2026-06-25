import { MeshStateStore } from '../../../libs/mesh/state/src/mesh-state.ts';

export interface GatewayConfig {
  apiKey: string;
  serialPath?: string;
  tcpUrl?: string;
}

export class MeshStreamGateway {
  private readonly config: GatewayConfig;

  constructor(config: GatewayConfig) {
    this.config = config;
  }

  start(): MeshStateStore {
    if (!this.config.apiKey) {
      throw new Error('Missing apiKey in gateway config');
    }

    return new MeshStateStore();
  }
}
