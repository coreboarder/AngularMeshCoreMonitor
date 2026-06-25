import type { MeshNodeTelemetry } from '../../domain-models/src/index.ts';
import { deriveGridLayout } from '../../ui-grid/src/index.ts';

export interface DashboardModel {
  nodeCount: number;
  grid: { rows: number; columns: number };
  selectedNode?: MeshNodeTelemetry;
  nodes: MeshNodeTelemetry[];
}

export function createDashboardModel(nodes: MeshNodeTelemetry[]): DashboardModel {
  return {
    nodeCount: nodes.length,
    grid: deriveGridLayout(nodes.length),
    selectedNode: nodes[0],
    nodes,
  };
}
