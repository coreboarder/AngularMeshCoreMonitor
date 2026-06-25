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
