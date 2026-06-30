import type { MeshNodeTelemetry, MeshNodeRole, MeshTrafficPath } from '../../domain-models/src/index.ts';
import type { MeshStreamEnvelope } from '../../stream-contracts/src/index.ts';

const roles: MeshNodeRole[] = ['client', 'repeater', 'room-server'];

export interface MeshSimulationOptions {
  nodeCount: number;
  seed?: number;
}

export class MeshTrafficSimulator {
  private sequence = 0;
  private readonly nodeCount: number;

  constructor(options: MeshSimulationOptions) {
    this.nodeCount = options.nodeCount;
  }

  nextTick(): MeshStreamEnvelope<MeshNodeTelemetry>[] {
    return Array.from({ length: this.nodeCount }, (_, index) => {
      const nodeId = `node-${index + 1}`;
      const telemetry: MeshNodeTelemetry = {
        id: nodeId,
        label: `Mesh Node ${index + 1}`,
        role: roles[index % roles.length],
        health: index % 11 === 0 ? 'warning' : 'healthy',
        batteryPercent: 100 - (index % 35),
        linkQuality: 100 - (index % 24),
        signalStrength: 70 + (index % 18),
        packetCount: this.sequence * 10 + index,
        routeDepth: 1 + (index % 5),
        lastSeenAt: new Date().toISOString(),
      };

      return {
        eventId: `${nodeId}-${this.sequence}`,
        sequence: ++this.sequence,
        timestamp: new Date().toISOString(),
        source: 'simulator',
        nodeId,
        kind: 'telemetry',
        payload: telemetry,
      };
    });
  }

  nextPaths(): MeshTrafficPath[] {
    return Array.from({ length: Math.min(18, this.nodeCount) }, (_, index) => {
      const sourceIndex = index;
      const relayIndex = (index + 3) % this.nodeCount;
      const destinationIndex = (index + 7) % this.nodeCount;

      return {
        id: `path-${sourceIndex + 1}-${relayIndex + 1}-${destinationIndex + 1}`,
        sourceId: `node-${sourceIndex + 1}`,
        relayId: `node-${relayIndex + 1}`,
        destinationId: `node-${destinationIndex + 1}`,
        intensity: 0.45 + ((index % 7) * 0.07),
        phase: index % 3 === 0 ? 'source' : index % 3 === 1 ? 'relay' : 'destination',
      };
    });
  }
}
