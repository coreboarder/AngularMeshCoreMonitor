import type { MeshNodeTelemetry } from '../../domain-models/src/index.ts';
import type { MeshStreamEnvelope } from '../../stream-contracts/src/index.ts';
import { MeshTrafficSimulator } from '../../simulation/src/index.ts';

export type MeshStreamSource = 'simulator' | 'serial' | 'tcp';

export interface MeshStateSnapshot {
  nodes: Map<string, MeshNodeTelemetry>;
  source: MeshStreamSource;
  sequence: number;
}

export class MeshStateStore {
  private readonly nodes = new Map<string, MeshNodeTelemetry>();
  private sequence = 0;
  private readonly simulator: MeshTrafficSimulator;

  constructor(simulator = new MeshTrafficSimulator({ nodeCount: 250 })) {
    this.simulator = simulator;
  }

  tick(): MeshStateSnapshot {
    const envelopes = this.simulator.nextTick();

    for (const envelope of envelopes) {
      this.applyEnvelope(envelope);
    }

    return {
      nodes: this.nodes,
      source: 'simulator',
      sequence: this.sequence,
    };
  }

  applyEnvelope(envelope: MeshStreamEnvelope<MeshNodeTelemetry>): void {
    this.nodes.set(envelope.nodeId, envelope.payload);
    this.sequence = envelope.sequence;
  }
}
