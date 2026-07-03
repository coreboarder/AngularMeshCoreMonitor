export type MeshNodeRole = 'client' | 'repeater' | 'room-server';
export type MeshNodeHealth = 'healthy' | 'warning' | 'critical' | 'offline';

export interface MeshNodeTelemetry {
  id: string;
  label: string;
  role: MeshNodeRole;
  health: MeshNodeHealth;
  batteryPercent: number;
  linkQuality: number;
  signalStrength: number;
  packetCount: number;
  routeDepth: number;
  lastSeenAt: string;
}

export interface MeshNodeCommandDraft {
  txPower: number;
  hopLimit: number;
  channelName: string;
}

export type MeshLinkType = 'direct' | 'relay';
export type MeshEdgeStatus = 'active' | 'degraded' | 'down';
export type MeshFlowPriority = 'low' | 'normal' | 'high' | 'critical';
export type MeshFlowDirection = 'forward' | 'reverse';

export interface MeshTopologyEdge {
  edgeId: string;
  fromNodeId: string;
  toNodeId: string;
  linkType: MeshLinkType;
  qualityScore: number;
  hopCount: number;
  status: MeshEdgeStatus;
}

export interface MeshTrafficFlow {
  flowId: string;
  edgeId?: string;
  routeEdgeIds?: string[];
  bytesPerSec: number;
  packetsPerSec: number;
  latencyMs: number;
  lossPct: number;
  priority: MeshFlowPriority;
  direction: MeshFlowDirection;
  startedAt: string;
  updatedAt: string;
}
