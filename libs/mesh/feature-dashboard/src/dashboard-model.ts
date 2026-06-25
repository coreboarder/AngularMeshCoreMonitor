import type { MeshNodeTelemetry } from '@mesh/domain-models';
import { deriveGridLayout } from '@mesh/ui-grid';

export interface DashboardModel {
  nodeCount: number;
  grid: { rows: number; columns: number };
  selectedNode?: MeshNodeTelemetry;
}

export function createDashboardModel(nodes: MeshNodeTelemetry[]): DashboardModel {
  return {
    nodeCount: nodes.length,
    grid: deriveGridLayout(nodes.length),
    selectedNode: nodes[0],
  };
}
