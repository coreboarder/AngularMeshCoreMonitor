import type { MeshNodeTelemetry } from '@mesh/domain-models';
import type { MeshStreamEnvelope } from '@mesh/stream-contracts';
import { MeshTrafficSimulator } from '@mesh/simulation';

export type MeshStreamSource = 'simulator' | 'serial' | 'tcp';

export interface MeshStateSnapshot {
  nodes: Map<string, MeshNodeTelemetry>;
  source: MeshStreamSource;
  sequence: number;
}

export class MeshStateStore {
  private readonly nodes = new Map<string, MeshNodeTelemetry>();
  private sequence = 0;

  constructor(private readonly simulator = new MeshTrafficSimulator({ nodeCount: 250 })) {}

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
