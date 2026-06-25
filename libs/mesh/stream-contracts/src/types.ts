export interface MeshStreamEnvelope<TPayload = unknown> {
  eventId: string;
  sequence: number;
  timestamp: string;
  source: 'simulator' | 'serial' | 'tcp';
  nodeId: string;
  kind: string;
  payload: TPayload;
}

export interface MeshStreamSnapshot {
  nodes: number;
  emittedAt: string;
}
