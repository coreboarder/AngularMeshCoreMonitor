import type { MeshNodeTelemetry } from '../../domain-models/src/index.ts';

export interface HexVisualState {
  borderGlow: number;
  pulseStrength: number;
  rotationDeg: number;
}

export function deriveHexVisualState(node: MeshNodeTelemetry): HexVisualState {
  return {
    borderGlow: Math.max(0.2, node.linkQuality / 100),
    pulseStrength: Math.max(0.2, node.signalStrength / 100),
    rotationDeg: (node.routeDepth % 6) * 10,
  };
}
