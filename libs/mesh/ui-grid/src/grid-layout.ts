export interface GridLayout {
  rows: number;
  columns: number;
}

export function deriveGridLayout(nodeCount: number): GridLayout {
  const columns = Math.ceil(Math.sqrt(nodeCount));
  const rows = Math.ceil(nodeCount / columns);

  return { rows, columns };
}
