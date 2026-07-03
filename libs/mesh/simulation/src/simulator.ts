import type { MeshNodeRole, MeshNodeTelemetry, MeshTopologyEdge, MeshTrafficFlow } from '../../domain-models/src/index.ts';
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

  nextTopologyEdges(): MeshTopologyEdge[] {
    return Array.from({ length: Math.min(72, this.nodeCount) }, (_, index) => {
      const from = index;
      const to = (index + 1 + (index % 5)) % this.nodeCount;

      return {
        edgeId: `edge-${from + 1}-${to + 1}`,
        fromNodeId: `node-${from + 1}`,
        toNodeId: `node-${to + 1}`,
        linkType: index % 4 === 0 ? 'relay' : 'direct',
        qualityScore: Math.max(0.25, 0.95 - ((index % 9) * 0.08)),
        hopCount: 1 + (index % 3),
        status: index % 13 === 0 ? 'degraded' : index % 29 === 0 ? 'down' : 'active',
      };
    });
  }

  nextTrafficFlows(edges = this.nextTopologyEdges()): MeshTrafficFlow[] {
    const now = new Date().toISOString();

    return Array.from({ length: Math.min(30, edges.length) }, (_, index) => {
      const primaryEdge = edges[index % edges.length];
      const secondaryEdge = edges[(index + 7) % edges.length];
      const includeRoute = index % 3 === 0;

      return {
        flowId: `flow-${index + 1}`,
        edgeId: includeRoute ? undefined : primaryEdge.edgeId,
        routeEdgeIds: includeRoute ? [primaryEdge.edgeId, secondaryEdge.edgeId] : undefined,
        bytesPerSec: 4800 + ((this.sequence + index) % 18) * 640,
        packetsPerSec: 120 + ((this.sequence + index) % 20) * 12,
        latencyMs: 18 + ((this.sequence + index) % 11) * 4,
        lossPct: Number((((this.sequence + index) % 8) * 0.25).toFixed(2)),
        priority: index % 10 === 0 ? 'critical' : index % 4 === 0 ? 'high' : index % 3 === 0 ? 'low' : 'normal',
        direction: index % 5 === 0 ? 'reverse' : 'forward',
        startedAt: now,
        updatedAt: now,
      };
    });
  }
}
