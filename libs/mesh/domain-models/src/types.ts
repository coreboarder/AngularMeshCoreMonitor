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

export interface MeshTrafficPath {
  id: string;
  sourceId: string;
  relayId?: string;
  destinationId: string;
  intensity: number;
  phase: 'source' | 'relay' | 'destination';
}
